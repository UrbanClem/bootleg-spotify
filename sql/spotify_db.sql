-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 21-11-2025 a las 15:31:14
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `spotify_db`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `AgregarCancionAPlaylist` (IN `p_id_playlist` INT, IN `p_id_cancion` INT, IN `p_orden` INT)   BEGIN
    DECLARE retry_count INT DEFAULT 0;
    DECLARE max_retries INT DEFAULT 3;
    DECLARE success BOOLEAN DEFAULT FALSE;
    
    WHILE retry_count < max_retries AND NOT success DO
        BEGIN
            DECLARE EXIT HANDLER FOR 1213 -- Código de error para deadlock
            BEGIN
                SET retry_count = retry_count + 1;
                IF retry_count = max_retries THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Deadlock después de múltiples intentos';
                END IF;
                DO SLEEP(0.1 * retry_count);
            END;
            
            INSERT INTO playlist_cancion (id_playlist, id_cancion, orden)
            VALUES (p_id_playlist, p_id_cancion, p_orden);
            
            SET success = TRUE;
        END;
    END WHILE;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `CrearPlaylistConCanciones` (IN `p_id_usuario` INT, IN `p_nombre_playlist` VARCHAR(255), IN `p_privada` BOOLEAN, IN `p_canciones` JSON)   BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Insertar la nueva playlist
    INSERT INTO playlist (nombre_playlist, id_usuario, privada, fecha_creacion)
    VALUES (p_nombre_playlist, p_id_usuario, p_privada, NOW());
    
    SET @nueva_playlist_id = LAST_INSERT_ID();
    
    -- Insertar canciones en la playlist
    SET @i = 0;
    SET @canciones_count = JSON_LENGTH(p_canciones);
    
    WHILE @i < @canciones_count DO
        INSERT INTO playlist_cancion (id_playlist, id_cancion, orden)
        VALUES (
            @nueva_playlist_id,
            JSON_UNQUOTE(JSON_EXTRACT(p_canciones, CONCAT('$[', @i, '].id_cancion'))),
            JSON_UNQUOTE(JSON_EXTRACT(p_canciones, CONCAT('$[', @i, '].orden')))
        );
        SET @i = @i + 1;
    END WHILE;
    
    -- Verificar que todas las canciones se insertaron
    IF (SELECT COUNT(*) FROM playlist_cancion WHERE id_playlist = @nueva_playlist_id) = @canciones_count THEN
        COMMIT;
        SELECT 'Playlist creada exitosamente' AS resultado, @nueva_playlist_id AS id_playlist;
    ELSE
        ROLLBACK;
        SELECT 'Error: No se pudieron agregar todas las canciones' AS resultado;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `IncrementarPopularidadCancion` (IN `p_id_cancion` INT)   BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    UPDATE cancion
    SET popularidad = popularidad + 1
    WHERE id_cancion = p_id_cancion;
    
    IF ROW_COUNT() = 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Canción no encontrada';
    ELSE
        COMMIT;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `MigrarHistorialAntiguo` (IN `p_anio` INT)   BEGIN
    -- Mover datos antiguos a la tabla particionada (sin FKs)
    INSERT INTO historial_reproduccion_archivo
    SELECT * FROM historial_reproduccion 
    WHERE YEAR(fecha_reproduccion) = p_anio;
    
    -- Eliminar los datos movidos
    DELETE FROM historial_reproduccion 
    WHERE YEAR(fecha_reproduccion) = p_anio;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `RegistrarReproduccion` (IN `p_id_usuario` INT, IN `p_id_cancion` INT, IN `p_duracion_escuchada` INT, IN `p_dispositivo` VARCHAR(100))   BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Registrar en el historial
    INSERT INTO historial_reproduccion (id_usuario, id_cancion, duracion_escuchada, dispositivo)
    VALUES (p_id_usuario, p_id_cancion, p_duracion_escuchada, p_dispositivo);
    
    -- Actualizar popularidad de la canción
    UPDATE cancion 
    SET popularidad = popularidad + 1 
    WHERE id_cancion = p_id_cancion;
    
    -- Actualizar reproducciones totales del artista
    UPDATE artista a
    JOIN cancion c ON a.id_artista = c.id_artista
    SET a.reproducciones_totales = a.reproducciones_totales + 1
    WHERE c.id_cancion = p_id_cancion;
    
    COMMIT;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `SeguirUsuarioYCrearPlaylist` (IN `p_id_usuario_seguidor` INT, IN `p_id_usuario_seguido` INT)   BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Seguir al usuario
    INSERT INTO seguidores (id_usuario, id_usuario_seguido, fecha_seguimiento)
    VALUES (p_id_usuario_seguidor, p_id_usuario_seguido, NOW());
    
    -- Crear nueva playlist
    INSERT INTO playlist (nombre_playlist, id_usuario, privada, fecha_creacion)
    VALUES (CONCAT('Playlist inspirada en usuario ', p_id_usuario_seguido), p_id_usuario_seguidor, FALSE, NOW());
    
    SET @nueva_playlist_id = LAST_INSERT_ID();
    
    -- Copiar primeras 10 canciones de las playlists del usuario seguido
    INSERT INTO playlist_cancion (id_playlist, id_cancion, orden)
    SELECT @nueva_playlist_id, pc.id_cancion, ROW_NUMBER() OVER()
    FROM playlist_cancion pc
    JOIN playlist p ON pc.id_playlist = p.id_playlist
    WHERE p.id_usuario = p_id_usuario_seguido
    LIMIT 10;
    
    COMMIT;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `album`
--

CREATE TABLE `album` (
  `id_album` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `id_artista` int(11) NOT NULL,
  `fecha_lanzamiento` date DEFAULT NULL,
  `portada` varchar(255) DEFAULT NULL,
  `genero` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `album`
--

INSERT INTO `album` (`id_album`, `titulo`, `id_artista`, `fecha_lanzamiento`, `portada`, `genero`) VALUES
(6, 'Toxicity', 6, '2001-09-04', '691df4758296f.jpg', 'Nu Metal');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `artista`
--

CREATE TABLE `artista` (
  `id_artista` int(11) NOT NULL,
  `nombre_artista` varchar(100) NOT NULL,
  `verificado` tinyint(1) DEFAULT 0,
  `biografia` text DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  `reproducciones_totales` bigint(20) DEFAULT 0,
  `seguidores` int(11) DEFAULT 0,
  `foto_perfil` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `artista`
--

INSERT INTO `artista` (`id_artista`, `nombre_artista`, `verificado`, `biografia`, `fecha_registro`, `reproducciones_totales`, `seguidores`, `foto_perfil`) VALUES
(2, 'Taylor Swift', 1, NULL, '2018-03-10', 0, 2, NULL),
(3, 'The Weeknd', 1, NULL, '2019-07-22', 0, 2, NULL),
(4, 'Shakira', 1, NULL, '2015-01-20', 0, 2, NULL),
(5, 'Ed Sheeran', 1, NULL, '2017-08-14', 0, 2, NULL),
(6, 'System Of A Down', 1, 'System of a Down es una banda armenio-estadounidense de heavy metal, formada en 1994 en Glendale, California.​ Está integrada por el vocalista Serj Tankian, el guitarrista Daron Malakian, el bajista Shavo Odadjian y el baterista John Dolmayan.​ Los miembros de la banda son de origen armenio.​​', '2025-11-19', 0, 0, 'System_Of_A_Down_691df42f8362b.webp');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `artista_seguido`
--

CREATE TABLE `artista_seguido` (
  `id_usuario` int(11) NOT NULL,
  `id_artista` int(11) NOT NULL,
  `fecha_seguimiento` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `artista_seguido`
--
DELIMITER $$
CREATE TRIGGER `actualizar_seguidores_artista` AFTER INSERT ON `artista_seguido` FOR EACH ROW BEGIN
    UPDATE artista 
    SET seguidores = seguidores + 1 
    WHERE id_artista = NEW.id_artista;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `decrementar_seguidores_artista` AFTER DELETE ON `artista_seguido` FOR EACH ROW BEGIN
    UPDATE artista 
    SET seguidores = seguidores - 1 
    WHERE id_artista = OLD.id_artista;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cancion`
--

CREATE TABLE `cancion` (
  `id_cancion` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `duracion` int(11) NOT NULL,
  `id_artista` int(11) NOT NULL,
  `id_album` int(11) DEFAULT NULL,
  `popularidad` int(11) DEFAULT 0,
  `fecha_lanzamiento` date DEFAULT NULL,
  `archivo_audio` varchar(255) NOT NULL,
  `letra` text DEFAULT NULL,
  `explicit` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cancion`
--

INSERT INTO `cancion` (`id_cancion`, `titulo`, `duracion`, `id_artista`, `id_album`, `popularidad`, `fecha_lanzamiento`, `archivo_audio`, `letra`, `explicit`) VALUES
(10, 'Toxicity', 205, 6, 6, 0, '2001-09-04', '691df840875d7.mp3', '', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_reproduccion`
--

CREATE TABLE `historial_reproduccion` (
  `id_reproduccion` bigint(20) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_cancion` int(11) NOT NULL,
  `fecha_reproduccion` datetime DEFAULT current_timestamp(),
  `duracion_escuchada` int(11) DEFAULT NULL,
  `dispositivo` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_reproduccion_archivo`
--

CREATE TABLE `historial_reproduccion_archivo` (
  `id_reproduccion` bigint(20) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_cancion` int(11) NOT NULL,
  `fecha_reproduccion` datetime DEFAULT NULL,
  `duracion_escuchada` int(11) DEFAULT NULL,
  `dispositivo` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos`
--

CREATE TABLE `pagos` (
  `id_pago` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_pago` datetime DEFAULT current_timestamp(),
  `metodo_pago` varchar(50) DEFAULT NULL,
  `estado` enum('Completado','Pendiente','Fallido') DEFAULT 'Pendiente',
  `id_suscripcion` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `playlist`
--

CREATE TABLE `playlist` (
  `id_playlist` int(11) NOT NULL,
  `nombre_playlist` varchar(255) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `privada` tinyint(1) DEFAULT 0,
  `portada` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `playlist`
--

INSERT INTO `playlist` (`id_playlist`, `nombre_playlist`, `id_usuario`, `descripcion`, `fecha_creacion`, `privada`, `portada`) VALUES
(6, 'test', 13, 'esto es una playlist', '2025-11-07 11:00:03', 0, NULL),
(7, 'test priv', 13, 'esto debe ser privado', '2025-11-07 11:00:17', 1, NULL),
(8, 'Mis Fav', 16, '', '2025-11-21 08:10:32', 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `playlist_cancion`
--

CREATE TABLE `playlist_cancion` (
  `id_playlist` int(11) NOT NULL,
  `id_cancion` int(11) NOT NULL,
  `orden` int(11) NOT NULL,
  `fecha_agregado` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `playlist_cancion`
--

INSERT INTO `playlist_cancion` (`id_playlist`, `id_cancion`, `orden`, `fecha_agregado`) VALUES
(6, 10, 1, '2025-11-21 08:07:28'),
(8, 10, 1, '2025-11-21 08:10:38');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recomendaciones`
--

CREATE TABLE `recomendaciones` (
  `id_recomendacion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_cancion` int(11) NOT NULL,
  `puntuacion` decimal(3,2) DEFAULT NULL,
  `fecha_recomendacion` datetime DEFAULT current_timestamp(),
  `algoritmo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguidores`
--

CREATE TABLE `seguidores` (
  `id_usuario` int(11) NOT NULL,
  `id_usuario_seguido` int(11) NOT NULL,
  `fecha_seguimiento` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `suscripciones`
--

CREATE TABLE `suscripciones` (
  `id_suscripcion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `tipo` enum('Free','Premium','Family','Student') DEFAULT 'Free',
  `fecha_inicio` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `estado` enum('Activa','Cancelada','Expirada') DEFAULT 'Activa',
  `costo_mensual` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `salt` varchar(32) NOT NULL,
  `fecha_registro` date NOT NULL,
  `tipo_cuenta` enum('Free','Premium','Admin') DEFAULT 'Free',
  `saldo` decimal(10,2) DEFAULT 0.00,
  `fecha_nacimiento` date DEFAULT NULL,
  `ultima_conexion` datetime DEFAULT NULL,
  `pais` varchar(100) DEFAULT NULL,
  `version_row` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre`, `email`, `password_hash`, `salt`, `fecha_registro`, `tipo_cuenta`, `saldo`, `fecha_nacimiento`, `ultima_conexion`, `pais`, `version_row`) VALUES
(13, 'Alejandro Rodriguez', 'test@email.com', '$2y$10$HTqezdHyRuZDdaeoUiXCpeXAAIw/aUE08d0COeaU6AQn7y8sQX10i', '', '2025-11-07', 'Admin', 0.00, '1990-01-01', '2025-11-21 07:59:28', 'México', 1),
(16, 'premium', 'premium@email.com', '$2y$10$1Qd77akWpHd1tVczSIZeH.j6uF9OKxPfdoUZ8RL7UrMhSpcV78GxG', '', '2025-11-19', 'Premium', 0.00, '1990-01-01', '2025-11-21 08:08:49', 'Desconocido', 1);

--
-- Disparadores `usuario`
--
DELIMITER $$
CREATE TRIGGER `actualizar_ultima_conexion` BEFORE UPDATE ON `usuario` FOR EACH ROW BEGIN
    IF NEW.version_row != OLD.version_row THEN
        SET NEW.ultima_conexion = NOW();
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_artistas_populares`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_artistas_populares` (
`id_artista` int(11)
,`nombre_artista` varchar(100)
,`verificado` tinyint(1)
,`reproducciones_totales` bigint(20)
,`total_canciones` bigint(21)
,`total_seguidores` bigint(21)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_canciones_populares`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_canciones_populares` (
`id_cancion` int(11)
,`titulo` varchar(255)
,`nombre_artista` varchar(100)
,`album` varchar(255)
,`popularidad` int(11)
,`duracion` int(11)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_historial_completo`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_historial_completo` (
`id_reproduccion` bigint(20)
,`id_usuario` int(11)
,`id_cancion` int(11)
,`fecha_reproduccion` datetime
,`duracion_escuchada` int(11)
,`dispositivo` varchar(100)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_playlists_usuario`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_playlists_usuario` (
`id_playlist` int(11)
,`nombre_playlist` varchar(255)
,`descripcion` text
,`usuario_creador` varchar(100)
,`total_canciones` bigint(21)
,`fecha_creacion` datetime
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_artistas_populares`
--
DROP TABLE IF EXISTS `vista_artistas_populares`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_artistas_populares`  AS SELECT `a`.`id_artista` AS `id_artista`, `a`.`nombre_artista` AS `nombre_artista`, `a`.`verificado` AS `verificado`, `a`.`reproducciones_totales` AS `reproducciones_totales`, count(distinct `c`.`id_cancion`) AS `total_canciones`, count(distinct `asg`.`id_usuario`) AS `total_seguidores` FROM ((`artista` `a` left join `cancion` `c` on(`a`.`id_artista` = `c`.`id_artista`)) left join `artista_seguido` `asg` on(`a`.`id_artista` = `asg`.`id_artista`)) GROUP BY `a`.`id_artista` ORDER BY `a`.`reproducciones_totales` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_canciones_populares`
--
DROP TABLE IF EXISTS `vista_canciones_populares`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_canciones_populares`  AS SELECT `c`.`id_cancion` AS `id_cancion`, `c`.`titulo` AS `titulo`, `a`.`nombre_artista` AS `nombre_artista`, `al`.`titulo` AS `album`, `c`.`popularidad` AS `popularidad`, `c`.`duracion` AS `duracion` FROM ((`cancion` `c` join `artista` `a` on(`c`.`id_artista` = `a`.`id_artista`)) left join `album` `al` on(`c`.`id_album` = `al`.`id_album`)) ORDER BY `c`.`popularidad` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_historial_completo`
--
DROP TABLE IF EXISTS `vista_historial_completo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_historial_completo`  AS SELECT `historial_reproduccion`.`id_reproduccion` AS `id_reproduccion`, `historial_reproduccion`.`id_usuario` AS `id_usuario`, `historial_reproduccion`.`id_cancion` AS `id_cancion`, `historial_reproduccion`.`fecha_reproduccion` AS `fecha_reproduccion`, `historial_reproduccion`.`duracion_escuchada` AS `duracion_escuchada`, `historial_reproduccion`.`dispositivo` AS `dispositivo` FROM `historial_reproduccion`union all select `historial_reproduccion_archivo`.`id_reproduccion` AS `id_reproduccion`,`historial_reproduccion_archivo`.`id_usuario` AS `id_usuario`,`historial_reproduccion_archivo`.`id_cancion` AS `id_cancion`,`historial_reproduccion_archivo`.`fecha_reproduccion` AS `fecha_reproduccion`,`historial_reproduccion_archivo`.`duracion_escuchada` AS `duracion_escuchada`,`historial_reproduccion_archivo`.`dispositivo` AS `dispositivo` from `historial_reproduccion_archivo`  ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_playlists_usuario`
--
DROP TABLE IF EXISTS `vista_playlists_usuario`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_playlists_usuario`  AS SELECT `p`.`id_playlist` AS `id_playlist`, `p`.`nombre_playlist` AS `nombre_playlist`, `p`.`descripcion` AS `descripcion`, `u`.`nombre` AS `usuario_creador`, count(`pc`.`id_cancion`) AS `total_canciones`, `p`.`fecha_creacion` AS `fecha_creacion` FROM ((`playlist` `p` join `usuario` `u` on(`p`.`id_usuario` = `u`.`id_usuario`)) left join `playlist_cancion` `pc` on(`p`.`id_playlist` = `pc`.`id_playlist`)) GROUP BY `p`.`id_playlist` ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `album`
--
ALTER TABLE `album`
  ADD PRIMARY KEY (`id_album`),
  ADD KEY `id_artista` (`id_artista`),
  ADD KEY `idx_titulo` (`titulo`),
  ADD KEY `idx_fecha_lanzamiento` (`fecha_lanzamiento`);

--
-- Indices de la tabla `artista`
--
ALTER TABLE `artista`
  ADD PRIMARY KEY (`id_artista`),
  ADD KEY `idx_nombre_artista` (`nombre_artista`),
  ADD KEY `idx_verificado` (`verificado`);

--
-- Indices de la tabla `artista_seguido`
--
ALTER TABLE `artista_seguido`
  ADD PRIMARY KEY (`id_usuario`,`id_artista`),
  ADD KEY `id_artista` (`id_artista`);

--
-- Indices de la tabla `cancion`
--
ALTER TABLE `cancion`
  ADD PRIMARY KEY (`id_cancion`),
  ADD KEY `id_album` (`id_album`),
  ADD KEY `idx_titulo` (`titulo`),
  ADD KEY `idx_popularidad` (`popularidad`),
  ADD KEY `idx_artista` (`id_artista`);
ALTER TABLE `cancion` ADD FULLTEXT KEY `idx_busqueda` (`titulo`);

--
-- Indices de la tabla `historial_reproduccion`
--
ALTER TABLE `historial_reproduccion`
  ADD PRIMARY KEY (`id_reproduccion`),
  ADD KEY `id_cancion` (`id_cancion`),
  ADD KEY `idx_usuario_fecha` (`id_usuario`,`fecha_reproduccion`),
  ADD KEY `idx_fecha_reproduccion` (`fecha_reproduccion`);

--
-- Indices de la tabla `historial_reproduccion_archivo`
--
ALTER TABLE `historial_reproduccion_archivo`
  ADD KEY `idx_archivo_usuario` (`id_usuario`),
  ADD KEY `idx_archivo_fecha` (`fecha_reproduccion`);

--
-- Indices de la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`id_pago`),
  ADD KEY `id_suscripcion` (`id_suscripcion`),
  ADD KEY `idx_usuario_fecha` (`id_usuario`,`fecha_pago`);

--
-- Indices de la tabla `playlist`
--
ALTER TABLE `playlist`
  ADD PRIMARY KEY (`id_playlist`),
  ADD KEY `idx_usuario` (`id_usuario`),
  ADD KEY `idx_nombre` (`nombre_playlist`);

--
-- Indices de la tabla `playlist_cancion`
--
ALTER TABLE `playlist_cancion`
  ADD PRIMARY KEY (`id_playlist`,`id_cancion`),
  ADD KEY `id_cancion` (`id_cancion`),
  ADD KEY `idx_orden` (`orden`);

--
-- Indices de la tabla `recomendaciones`
--
ALTER TABLE `recomendaciones`
  ADD PRIMARY KEY (`id_recomendacion`),
  ADD KEY `id_cancion` (`id_cancion`),
  ADD KEY `idx_usuario_algoritmo` (`id_usuario`,`algoritmo`),
  ADD KEY `idx_fecha_recomendacion` (`fecha_recomendacion`);

--
-- Indices de la tabla `seguidores`
--
ALTER TABLE `seguidores`
  ADD PRIMARY KEY (`id_usuario`,`id_usuario_seguido`),
  ADD KEY `id_usuario_seguido` (`id_usuario_seguido`),
  ADD KEY `idx_fecha_seguimiento` (`fecha_seguimiento`);

--
-- Indices de la tabla `suscripciones`
--
ALTER TABLE `suscripciones`
  ADD PRIMARY KEY (`id_suscripcion`),
  ADD KEY `idx_usuario_estado` (`id_usuario`,`estado`),
  ADD KEY `idx_vencimiento` (`fecha_vencimiento`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_tipo_cuenta` (`tipo_cuenta`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `album`
--
ALTER TABLE `album`
  MODIFY `id_album` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `artista`
--
ALTER TABLE `artista`
  MODIFY `id_artista` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `cancion`
--
ALTER TABLE `cancion`
  MODIFY `id_cancion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `historial_reproduccion`
--
ALTER TABLE `historial_reproduccion`
  MODIFY `id_reproduccion` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id_pago` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `playlist`
--
ALTER TABLE `playlist`
  MODIFY `id_playlist` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `recomendaciones`
--
ALTER TABLE `recomendaciones`
  MODIFY `id_recomendacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `suscripciones`
--
ALTER TABLE `suscripciones`
  MODIFY `id_suscripcion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `album`
--
ALTER TABLE `album`
  ADD CONSTRAINT `album_ibfk_1` FOREIGN KEY (`id_artista`) REFERENCES `artista` (`id_artista`) ON DELETE CASCADE;

--
-- Filtros para la tabla `artista_seguido`
--
ALTER TABLE `artista_seguido`
  ADD CONSTRAINT `artista_seguido_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `artista_seguido_ibfk_2` FOREIGN KEY (`id_artista`) REFERENCES `artista` (`id_artista`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cancion`
--
ALTER TABLE `cancion`
  ADD CONSTRAINT `cancion_ibfk_1` FOREIGN KEY (`id_artista`) REFERENCES `artista` (`id_artista`) ON DELETE CASCADE,
  ADD CONSTRAINT `cancion_ibfk_2` FOREIGN KEY (`id_album`) REFERENCES `album` (`id_album`) ON DELETE SET NULL;

--
-- Filtros para la tabla `historial_reproduccion`
--
ALTER TABLE `historial_reproduccion`
  ADD CONSTRAINT `historial_reproduccion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `historial_reproduccion_ibfk_2` FOREIGN KEY (`id_cancion`) REFERENCES `cancion` (`id_cancion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `pagos_ibfk_2` FOREIGN KEY (`id_suscripcion`) REFERENCES `suscripciones` (`id_suscripcion`);

--
-- Filtros para la tabla `playlist`
--
ALTER TABLE `playlist`
  ADD CONSTRAINT `playlist_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `playlist_cancion`
--
ALTER TABLE `playlist_cancion`
  ADD CONSTRAINT `playlist_cancion_ibfk_1` FOREIGN KEY (`id_playlist`) REFERENCES `playlist` (`id_playlist`) ON DELETE CASCADE,
  ADD CONSTRAINT `playlist_cancion_ibfk_2` FOREIGN KEY (`id_cancion`) REFERENCES `cancion` (`id_cancion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `recomendaciones`
--
ALTER TABLE `recomendaciones`
  ADD CONSTRAINT `recomendaciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `recomendaciones_ibfk_2` FOREIGN KEY (`id_cancion`) REFERENCES `cancion` (`id_cancion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `seguidores`
--
ALTER TABLE `seguidores`
  ADD CONSTRAINT `seguidores_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `seguidores_ibfk_2` FOREIGN KEY (`id_usuario_seguido`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `suscripciones`
--
ALTER TABLE `suscripciones`
  ADD CONSTRAINT `suscripciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
