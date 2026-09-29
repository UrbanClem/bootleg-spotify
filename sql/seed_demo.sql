-- ===========================================================================
-- Demo seed data for the Bootleg Spotify UI.
--
-- Adds a realistic catalogue so the Spotify-style layout (home shelves,
-- library, search, album pages) can actually be evaluated. Existing rows are
-- preserved: every insert uses a high, non-colliding id range and only
-- touches the user that owns the demo playlists.
--
-- Safe to run more than once - it clears its own id range first.
--
-- The client charset matters. Without --default-character-set=utf8mb4 the
-- connection negotiates latin1, and every accented character in the Spanish
-- copy is flattened to "?" on the way in ("electrónica" -> "electr?nica").
-- Those mangled strings then show up in artist bios across the whole UI.
--
-- Run with:
--   docker exec -i bootleg-spotify-db mysql -uroot \
--     --default-character-set=utf8mb4 spotify_db < sql/seed_demo.sql
-- ===========================================================================

SET NAMES utf8mb4;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;

-- Remove a previous run of this seed (ids 1000+) so re-running is clean.
DELETE FROM playlist_cancion WHERE id_playlist >= 1000;
DELETE FROM playlist       WHERE id_playlist >= 1000;
DELETE FROM cancion        WHERE id_cancion  >= 1000;
DELETE FROM album          WHERE id_album    >= 1000;
DELETE FROM artista        WHERE id_artista  >= 1000;

-- --------------------------------------------------------
-- Artistas
-- --------------------------------------------------------
INSERT INTO `artista`
(`id_artista`, `nombre_artista`, `verificado`, `biografia`, `fecha_registro`, `reproducciones_totales`, `seguidores`, `foto_perfil`)
VALUES
(1001, 'Aurora Lane',    1, 'Cantautora de synth-pop con letraslois. Tres albums en Independent Records.', '2019-04-12', 0, 1240000, NULL),
(1002, 'Neon Cathedral', 1, 'Banda de post-rock que mezcla texturas ambientes con ritmos densos.', '2017-11-03', 0, 486000, NULL),
(1003, 'DJ Marisol',     1, 'Productora electrónica. Residente del festival Costa Dorada.', '2020-06-21', 0, 733000, NULL),
(1004, 'The Velvet Hours', 1, 'Cuarteto de indie rock con escenarios intimate y mucho feedback.', '2018-09-30', 0, 219000, NULL),
(1005, 'Kofi Mensah',    0, 'Bajista y productor. Tono cálido, grooves lentos.', '2021-02-14', 0, 58000, NULL),
(1006, 'RitaSound',      1, 'Pop latino urbano. Colaboraciones con los más grandes del género.', '2016-08-08', 0, 2100000, NULL),
(1007, 'Basement Tapes', 0, 'Dúo acústico que grabó su primer EP en un sótano.', '2022-03-19', 0, 41000, NULL),
(1008, 'Halcyon Bloom',  1, 'Artista de indie folk con armonías vocales en capas.', '2020-10-05', 0, 327000, NULL),
(1009, 'Static Youth',   0, 'Punk revival con letras sobre la vida urbana.', '2019-01-30', 0, 96000, NULL),
(1010, 'Lena Petrova',   0, 'Pianista y compositora de música de cámara electrónica.', '2021-11-11', 0, 137000, NULL),
(1011, 'Costa Dorada',   1, 'Indie tropical. Cumbia futurista y sintetizadores.', '2018-05-16', 0, 502000, NULL),
(1012, 'Midnight Motel', 1, 'Rock alternativo nocturno, muy citado en playlists de madrugada.', '2017-02-27', 0, 891000, NULL);

-- --------------------------------------------------------
-- Albums
-- --------------------------------------------------------
INSERT INTO `album`
(`id_album`, `titulo`, `id_artista`, `fecha_lanzamiento`, `portada`, `genero`)
VALUES
(1001, 'Northern Lights',      1001, '2022-03-18', NULL, 'Synth-pop'),
(1002, 'Paper Cities',         1001, '2024-09-06', NULL, 'Synth-pop'),
(1003, 'Cathedral Tapes',      1002, '2021-06-11', NULL, 'Post-rock'),
(1004, 'Costa Dorada',         1011, '2020-07-24', NULL, 'Indie tropical'),
(1005, 'Late Checkout',        1012, '2019-11-08', NULL, 'Alt rock'),
(1006, 'Bloomfield',           1008, '2023-04-14', NULL, 'Indie folk'),
(1007, 'Static Youth EP',      1009, '2019-05-30', NULL, 'Punk'),
(1008, 'Basement Tapes',       1007, '2022-04-22', NULL, 'Folktronica'),
(1009, 'Marisol Sessions',     1003, '2023-08-25', NULL, 'Electronica'),
(1010, 'Velvet Hours',         1004, '2021-10-15', NULL, 'Indie rock'),
(1011, 'Kofi Sings',           1005, '2022-09-09', NULL, 'Neo soul'),
(1012, 'RitaSound: La Session',1006, '2024-02-16', NULL, 'Pop urbano');

-- --------------------------------------------------------
-- Canciones
-- --------------------------------------------------------
INSERT INTO `cancion`
(`id_cancion`, `titulo`, `duracion`, `id_artista`, `id_album`, `popularidad`, `fecha_lanzamiento`, `archivo_audio`, `letra`, `explicit`)
VALUES
(1001, 'Aurora',              214, 1001, 1001, 92, '2022-03-18', NULL, '', 0),
(1002, 'Glass Houses',        198, 1001, 1001, 88, '2022-03-18', NULL, '', 0),
(1003, 'Satellite Heart',     246, 1001, 1001, 84, '2022-03-18', NULL, '', 1),
(1004, 'Paper Planes',        187, 1001, 1002, 90, '2024-09-06', NULL, '', 0),
(1005, 'Static Bloom',        232, 1001, 1002, 79, '2024-09-06', NULL, '', 0),
(1006, 'Cathedral',           341, 1002, 1003, 76, '2021-06-11', NULL, '', 0),
(1007, 'Slow Signal',         295, 1002, 1003, 71, '2021-06-11', NULL, '', 0),
(1008, 'Copper Rain',         228, 1011, 1004, 82, '2020-07-24', NULL, '', 0),
(1009, 'Mar de Vidrio',       205, 1011, 1004, 74, '2020-07-24', NULL, '', 0),
(1010, 'Checkout Time',       263, 1012, 1005, 68, '2019-11-08', NULL, '', 1),
(1011, 'Parking Lot Lights',  219, 1012, 1005, 64, '2019-11-08', NULL, '', 0),
(1012, 'Wildflower',          191, 1008, 1006, 77, '2023-04-14', NULL, '', 0),
(1013, 'Meadow Song',         176, 1008, 1006, 70, '2023-04-14', NULL, '', 0),
(1014, 'Concrete Summer',     158, 1009, 1007, 59, '2019-05-30', NULL, '', 1),
(1015, 'No Signal',           142, 1009, 1007, 55, '2019-05-30', NULL, '', 0),
(1016, 'Four Track',          244, 1007, 1008, 61, '2022-04-22', NULL, '', 0),
(1017, 'Dust on the Needle',  267, 1007, 1008, 54, '2022-04-22', NULL, '', 0),
(1018, 'Marisol',             312, 1003, 1009, 80, '2023-08-25', NULL, '', 0),
(1019, 'Costa Dorada',        276, 1003, 1009, 75, '2023-08-25', NULL, '', 0),
(1020, 'Velvet Rope',         201, 1004, 1010, 72, '2021-10-15', NULL, '', 0),
(1021, 'Back Room Sessions',  233, 1004, 1010, 66, '2021-10-15', NULL, '', 0),
(1022, 'Slow Tide',           259, 1005, 1011, 63, '2022-09-09', NULL, '', 0),
(1023, 'Cobalt Morning',      288, 1005, 1011, 58, '2022-09-09', NULL, '', 0),
(1024, 'La Session',          224, 1006, 1012, 85, '2024-02-16', NULL, '', 0),
(1025, 'Corazón de Neón',     197, 1006, 1012, 87, '2024-02-16', NULL, '', 0),
(1026, 'Brightest Thing',     211, 1001, 1001, 81, '2022-03-18', NULL, '', 0),
(1027, 'Undertow',            306, 1002, 1003, 69, '2021-06-11', NULL, '', 0),
(1028, 'Palma Sol',           183, 1011, 1004, 73, '2020-07-24', NULL, '', 0),
(1029, 'Room 12',             247, 1012, 1005, 62, '2019-11-08', NULL, '', 0),
(1030, 'Sunfade',             194, 1008, 1006, 65, '2023-04-14', NULL, '', 0);

-- --------------------------------------------------------
-- Playlists de demostración
--
-- The playlists are owned by the demo account rather than by a hardcoded id:
-- `GET /api/playlists` only ever returns rows belonging to the caller, so a
-- seed aimed at the wrong user makes the whole library look empty.
-- --------------------------------------------------------
SET @owner := COALESCE(
    (SELECT `id_usuario` FROM `usuario` WHERE `email` = 'test@email.com' LIMIT 1),
    1
);

INSERT INTO `playlist`
(`id_playlist`, `nombre_playlist`, `id_usuario`, `descripcion`, `fecha_creacion`, `privada`)
VALUES
(1001, 'Focus',            @owner, 'Sin voces, sin distracciones. Para trabajar.', '2024-02-01 10:00:00', 0),
(1002, 'Late Night Drive', @owner, 'Sintetizadores y luces de la ciudad.',           '2024-05-14 22:30:00', 0),
(1003, 'Costa Dorada Mix', @owner, 'Indie tropical y cumbia futurista.',            '2024-07-02 17:45:00', 0),
(1004, 'Nuevo en Spotify', @owner, 'Lo último que se agregó a tu biblioteca.',        '2024-08-20 09:15:00', 0),
(1005, 'Canciones favoritas', @owner, 'Lo que más escucho.',                        '2024-01-11 20:00:00', 1);

-- --------------------------------------------------------
-- Contenido de las playlists
-- --------------------------------------------------------
INSERT INTO `playlist_cancion` (`id_playlist`, `id_cancion`, `orden`, `fecha_agregado`)
VALUES
(1001, 1018, 1, '2024-02-01 10:00:00'),
(1001, 1019, 2, '2024-02-01 10:00:00'),
(1001, 1006, 3, '2024-02-01 10:00:00'),
(1001, 1007, 4, '2024-02-01 10:00:00'),
(1001, 1016, 5, '2024-02-01 10:00:00'),
(1001, 1027, 6, '2024-02-01 10:00:00'),
(1002, 1001, 1, '2024-05-14 22:30:00'),
(1002, 1002, 2, '2024-05-14 22:30:00'),
(1002, 1026, 3, '2024-05-14 22:30:00'),
(1002, 1004, 4, '2024-05-14 22:30:00'),
(1002, 1010, 5, '2024-05-14 22:30:00'),
(1002, 1029, 6, '2024-05-14 22:30:00'),
(1003, 1008, 1, '2024-07-02 17:45:00'),
(1003, 1009, 2, '2024-07-02 17:45:00'),
(1003, 1028, 3, '2024-07-02 17:45:00'),
(1003, 1012, 4, '2024-07-02 17:45:00'),
(1003, 1013, 5, '2024-07-02 17:45:00'),
(1004, 1024, 1, '2024-08-20 09:15:00'),
(1004, 1025, 2, '2024-08-20 09:15:00'),
(1004, 1030, 3, '2024-08-20 09:15:00'),
(1004, 1003, 4, '2024-08-20 09:15:00'),
(1005, 1001, 1, '2024-01-11 20:00:00'),
(1005, 1025, 2, '2024-01-11 20:00:00'),
(1005, 1002, 3, '2024-01-11 20:00:00'),
(1005, 1012, 4, '2024-01-11 20:00:00'),
(1005, 1024, 5, '2024-01-11 20:00:00'),
(1005, 1008, 6, '2024-01-11 20:00:00');

SET FOREIGN_KEY_CHECKS = 1;
