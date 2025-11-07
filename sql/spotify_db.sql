-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-11-2025 a las 17:53:38
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
-- Base de datos: `gimnasio`
--
CREATE DATABASE IF NOT EXISTS `gimnasio` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `gimnasio`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `membresias`
--

CREATE TABLE `membresias` (
  `id` int(11) NOT NULL,
  `miembro_id` int(11) NOT NULL,
  `tipo_id` int(11) NOT NULL,
  `dias_restantes` int(11) DEFAULT 0,
  `estado` enum('activa','inactiva','vencida') NOT NULL DEFAULT 'activa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `membresias`
--

INSERT INTO `membresias` (`id`, `miembro_id`, `tipo_id`, `dias_restantes`, `estado`) VALUES
(1, 1, 1, 15, 'activa'),
(2, 2, 2, 60, 'activa'),
(3, 3, 3, 0, 'vencida');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `miembros`
--

CREATE TABLE `miembros` (
  `id` int(11) NOT NULL,
  `numero_cuenta` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `miembros`
--

INSERT INTO `miembros` (`id`, `numero_cuenta`, `nombre`, `telefono`) VALUES
(1, 1001, 'Ana López', '3121234567'),
(2, 1002, 'Carlos Méndez', '3127654321'),
(3, 1003, 'Lucía Torres', '3129876543');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos`
--

CREATE TABLE `movimientos` (
  `id` int(11) NOT NULL,
  `membresia_id` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimientos`
--

INSERT INTO `movimientos` (`id`, `membresia_id`, `tipo`, `fecha`) VALUES
(1, 1, 'Pago inicial', '2025-08-01 10:00:00'),
(2, 2, 'Renovación', '2025-08-15 12:30:00'),
(3, 3, 'Vencimiento automático', '2025-09-01 08:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_membresia`
--

CREATE TABLE `tipos_membresia` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `costo` decimal(8,2) NOT NULL,
  `vigencia_dias` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipos_membresia`
--

INSERT INTO `tipos_membresia` (`id`, `nombre`, `costo`, `vigencia_dias`) VALUES
(1, 'Mensual Básica', 300.00, 30),
(2, 'Trimestral Premium', 800.00, 90),
(3, 'Anual VIP', 2500.00, 365);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `membresias`
--
ALTER TABLE `membresias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_miembro_id` (`miembro_id`),
  ADD KEY `idx_tipo_id` (`tipo_id`);

--
-- Indices de la tabla `miembros`
--
ALTER TABLE `miembros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_cuenta` (`numero_cuenta`);

--
-- Indices de la tabla `movimientos`
--
ALTER TABLE `movimientos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_membresia_id` (`membresia_id`);

--
-- Indices de la tabla `tipos_membresia`
--
ALTER TABLE `tipos_membresia`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `membresias`
--
ALTER TABLE `membresias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `miembros`
--
ALTER TABLE `miembros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `movimientos`
--
ALTER TABLE `movimientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tipos_membresia`
--
ALTER TABLE `tipos_membresia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `membresias`
--
ALTER TABLE `membresias`
  ADD CONSTRAINT `membresias_ibfk_1` FOREIGN KEY (`miembro_id`) REFERENCES `miembros` (`id`),
  ADD CONSTRAINT `membresias_ibfk_2` FOREIGN KEY (`tipo_id`) REFERENCES `tipos_membresia` (`id`);

--
-- Filtros para la tabla `movimientos`
--
ALTER TABLE `movimientos`
  ADD CONSTRAINT `movimientos_ibfk_1` FOREIGN KEY (`membresia_id`) REFERENCES `membresias` (`id`);
--
-- Base de datos: `phpmyadmin`
--
CREATE DATABASE IF NOT EXISTS `phpmyadmin` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE `phpmyadmin`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__bookmark`
--

CREATE TABLE `pma__bookmark` (
  `id` int(10) UNSIGNED NOT NULL,
  `dbase` varchar(255) NOT NULL DEFAULT '',
  `user` varchar(255) NOT NULL DEFAULT '',
  `label` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `query` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Bookmarks';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__central_columns`
--

CREATE TABLE `pma__central_columns` (
  `db_name` varchar(64) NOT NULL,
  `col_name` varchar(64) NOT NULL,
  `col_type` varchar(64) NOT NULL,
  `col_length` text DEFAULT NULL,
  `col_collation` varchar(64) NOT NULL,
  `col_isNull` tinyint(1) NOT NULL,
  `col_extra` varchar(255) DEFAULT '',
  `col_default` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Central list of columns';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__column_info`
--

CREATE TABLE `pma__column_info` (
  `id` int(5) UNSIGNED NOT NULL,
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `column_name` varchar(64) NOT NULL DEFAULT '',
  `comment` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `mimetype` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `transformation` varchar(255) NOT NULL DEFAULT '',
  `transformation_options` varchar(255) NOT NULL DEFAULT '',
  `input_transformation` varchar(255) NOT NULL DEFAULT '',
  `input_transformation_options` varchar(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Column information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__designer_settings`
--

CREATE TABLE `pma__designer_settings` (
  `username` varchar(64) NOT NULL,
  `settings_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Settings related to Designer';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__export_templates`
--

CREATE TABLE `pma__export_templates` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL,
  `export_type` varchar(10) NOT NULL,
  `template_name` varchar(64) NOT NULL,
  `template_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved export templates';

--
-- Volcado de datos para la tabla `pma__export_templates`
--

INSERT INTO `pma__export_templates` (`id`, `username`, `export_type`, `template_name`, `template_data`) VALUES
(1, 'root', 'database', 'eventospro', '{\"quick_or_custom\":\"custom\",\"what\":\"sql\",\"structure_or_data_forced\":\"0\",\"table_select[]\":\"usuarios\",\"table_structure[]\":\"usuarios\",\"table_data[]\":\"usuarios\",\"aliases_new\":\"\",\"output_format\":\"sendit\",\"filename_template\":\"@DATABASE@\",\"remember_template\":\"on\",\"charset\":\"utf-8\",\"compression\":\"none\",\"maxsize\":\"\",\"codegen_structure_or_data\":\"data\",\"codegen_format\":\"0\",\"csv_separator\":\",\",\"csv_enclosed\":\"\\\"\",\"csv_escaped\":\"\\\"\",\"csv_terminated\":\"AUTO\",\"csv_null\":\"NULL\",\"csv_columns\":\"something\",\"csv_structure_or_data\":\"data\",\"excel_null\":\"NULL\",\"excel_columns\":\"something\",\"excel_edition\":\"win\",\"excel_structure_or_data\":\"data\",\"json_structure_or_data\":\"data\",\"json_unicode\":\"something\",\"latex_caption\":\"something\",\"latex_structure_or_data\":\"structure_and_data\",\"latex_structure_caption\":\"Estructura de la tabla @TABLE@\",\"latex_structure_continued_caption\":\"Estructura de la tabla @TABLE@ (continúa)\",\"latex_structure_label\":\"tab:@TABLE@-structure\",\"latex_relation\":\"something\",\"latex_comments\":\"something\",\"latex_mime\":\"something\",\"latex_columns\":\"something\",\"latex_data_caption\":\"Contenido de la tabla @TABLE@\",\"latex_data_continued_caption\":\"Contenido de la tabla @TABLE@ (continúa)\",\"latex_data_label\":\"tab:@TABLE@-data\",\"latex_null\":\"\\\\textit{NULL}\",\"mediawiki_structure_or_data\":\"structure_and_data\",\"mediawiki_caption\":\"something\",\"mediawiki_headers\":\"something\",\"htmlword_structure_or_data\":\"structure_and_data\",\"htmlword_null\":\"NULL\",\"ods_null\":\"NULL\",\"ods_structure_or_data\":\"data\",\"odt_structure_or_data\":\"structure_and_data\",\"odt_relation\":\"something\",\"odt_comments\":\"something\",\"odt_mime\":\"something\",\"odt_columns\":\"something\",\"odt_null\":\"NULL\",\"pdf_report_title\":\"\",\"pdf_structure_or_data\":\"structure_and_data\",\"phparray_structure_or_data\":\"data\",\"sql_include_comments\":\"something\",\"sql_header_comment\":\"\",\"sql_use_transaction\":\"something\",\"sql_compatibility\":\"NONE\",\"sql_structure_or_data\":\"structure_and_data\",\"sql_create_table\":\"something\",\"sql_auto_increment\":\"something\",\"sql_create_view\":\"something\",\"sql_procedure_function\":\"something\",\"sql_create_trigger\":\"something\",\"sql_backquotes\":\"something\",\"sql_type\":\"INSERT\",\"sql_insert_syntax\":\"both\",\"sql_max_query_size\":\"50000\",\"sql_hex_for_binary\":\"something\",\"sql_utc_time\":\"something\",\"texytext_structure_or_data\":\"structure_and_data\",\"texytext_null\":\"NULL\",\"xml_structure_or_data\":\"data\",\"xml_export_events\":\"something\",\"xml_export_functions\":\"something\",\"xml_export_procedures\":\"something\",\"xml_export_tables\":\"something\",\"xml_export_triggers\":\"something\",\"xml_export_views\":\"something\",\"xml_export_contents\":\"something\",\"yaml_structure_or_data\":\"data\",\"\":null,\"lock_tables\":null,\"as_separate_files\":null,\"csv_removeCRLF\":null,\"excel_removeCRLF\":null,\"json_pretty_print\":null,\"htmlword_columns\":null,\"ods_columns\":null,\"sql_dates\":null,\"sql_relation\":null,\"sql_mime\":null,\"sql_disable_fk\":null,\"sql_views_as_tables\":null,\"sql_metadata\":null,\"sql_create_database\":null,\"sql_drop_table\":null,\"sql_if_not_exists\":null,\"sql_simple_view_export\":null,\"sql_view_current_user\":null,\"sql_or_replace_view\":null,\"sql_truncate\":null,\"sql_delayed\":null,\"sql_ignore\":null,\"texytext_columns\":null}'),
(2, 'root', 'database', 'punto_venta', '{\"quick_or_custom\":\"custom\",\"what\":\"sql\",\"structure_or_data_forced\":\"0\",\"table_select[]\":[\"categorias\",\"clientes\",\"detalle_orden\",\"empleados\",\"inventario\",\"ordenes\",\"roles\"],\"table_structure[]\":[\"categorias\",\"clientes\",\"detalle_orden\",\"empleados\",\"inventario\",\"ordenes\",\"roles\"],\"table_data[]\":[\"categorias\",\"clientes\",\"detalle_orden\",\"empleados\",\"inventario\",\"ordenes\",\"roles\"],\"aliases_new\":\"\",\"output_format\":\"sendit\",\"filename_template\":\"@DATABASE@\",\"remember_template\":\"on\",\"charset\":\"utf-8\",\"compression\":\"none\",\"maxsize\":\"\",\"codegen_structure_or_data\":\"data\",\"codegen_format\":\"0\",\"csv_separator\":\",\",\"csv_enclosed\":\"\\\"\",\"csv_escaped\":\"\\\"\",\"csv_terminated\":\"AUTO\",\"csv_null\":\"NULL\",\"csv_columns\":\"something\",\"csv_structure_or_data\":\"data\",\"excel_null\":\"NULL\",\"excel_columns\":\"something\",\"excel_edition\":\"win\",\"excel_structure_or_data\":\"data\",\"json_structure_or_data\":\"data\",\"json_unicode\":\"something\",\"latex_caption\":\"something\",\"latex_structure_or_data\":\"structure_and_data\",\"latex_structure_caption\":\"Estructura de la tabla @TABLE@\",\"latex_structure_continued_caption\":\"Estructura de la tabla @TABLE@ (continúa)\",\"latex_structure_label\":\"tab:@TABLE@-structure\",\"latex_relation\":\"something\",\"latex_comments\":\"something\",\"latex_mime\":\"something\",\"latex_columns\":\"something\",\"latex_data_caption\":\"Contenido de la tabla @TABLE@\",\"latex_data_continued_caption\":\"Contenido de la tabla @TABLE@ (continúa)\",\"latex_data_label\":\"tab:@TABLE@-data\",\"latex_null\":\"\\\\textit{NULL}\",\"mediawiki_structure_or_data\":\"structure_and_data\",\"mediawiki_caption\":\"something\",\"mediawiki_headers\":\"something\",\"htmlword_structure_or_data\":\"structure_and_data\",\"htmlword_null\":\"NULL\",\"ods_null\":\"NULL\",\"ods_structure_or_data\":\"data\",\"odt_structure_or_data\":\"structure_and_data\",\"odt_relation\":\"something\",\"odt_comments\":\"something\",\"odt_mime\":\"something\",\"odt_columns\":\"something\",\"odt_null\":\"NULL\",\"pdf_report_title\":\"\",\"pdf_structure_or_data\":\"structure_and_data\",\"phparray_structure_or_data\":\"data\",\"sql_include_comments\":\"something\",\"sql_header_comment\":\"\",\"sql_use_transaction\":\"something\",\"sql_compatibility\":\"NONE\",\"sql_structure_or_data\":\"structure_and_data\",\"sql_create_table\":\"something\",\"sql_auto_increment\":\"something\",\"sql_create_view\":\"something\",\"sql_procedure_function\":\"something\",\"sql_create_trigger\":\"something\",\"sql_backquotes\":\"something\",\"sql_type\":\"INSERT\",\"sql_insert_syntax\":\"both\",\"sql_max_query_size\":\"50000\",\"sql_hex_for_binary\":\"something\",\"sql_utc_time\":\"something\",\"texytext_structure_or_data\":\"structure_and_data\",\"texytext_null\":\"NULL\",\"xml_structure_or_data\":\"data\",\"xml_export_events\":\"something\",\"xml_export_functions\":\"something\",\"xml_export_procedures\":\"something\",\"xml_export_tables\":\"something\",\"xml_export_triggers\":\"something\",\"xml_export_views\":\"something\",\"xml_export_contents\":\"something\",\"yaml_structure_or_data\":\"data\",\"\":null,\"lock_tables\":null,\"as_separate_files\":null,\"csv_removeCRLF\":null,\"excel_removeCRLF\":null,\"json_pretty_print\":null,\"htmlword_columns\":null,\"ods_columns\":null,\"sql_dates\":null,\"sql_relation\":null,\"sql_mime\":null,\"sql_disable_fk\":null,\"sql_views_as_tables\":null,\"sql_metadata\":null,\"sql_create_database\":null,\"sql_drop_table\":null,\"sql_if_not_exists\":null,\"sql_simple_view_export\":null,\"sql_view_current_user\":null,\"sql_or_replace_view\":null,\"sql_truncate\":null,\"sql_delayed\":null,\"sql_ignore\":null,\"texytext_columns\":null}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__favorite`
--

CREATE TABLE `pma__favorite` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Favorite tables';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__history`
--

CREATE TABLE `pma__history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db` varchar(64) NOT NULL DEFAULT '',
  `table` varchar(64) NOT NULL DEFAULT '',
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp(),
  `sqlquery` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='SQL history for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__navigationhiding`
--

CREATE TABLE `pma__navigationhiding` (
  `username` varchar(64) NOT NULL,
  `item_name` varchar(64) NOT NULL,
  `item_type` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Hidden items of navigation tree';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__pdf_pages`
--

CREATE TABLE `pma__pdf_pages` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `page_nr` int(10) UNSIGNED NOT NULL,
  `page_descr` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='PDF relation pages for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__recent`
--

CREATE TABLE `pma__recent` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Recently accessed tables';

--
-- Volcado de datos para la tabla `pma__recent`
--

INSERT INTO `pma__recent` (`username`, `tables`) VALUES
('root', '[{\"db\":\"spotify_db\",\"table\":\"playlist\"},{\"db\":\"spotify_db\",\"table\":\"usuario\"},{\"db\":\"spotify_db\",\"table\":\"cancion\"},{\"db\":\"spotify_db\",\"table\":\"artista_seguido\"},{\"db\":\"spotify_db\",\"table\":\"album\"},{\"db\":\"spotify_db\",\"table\":\"suscripciones\"},{\"db\":\"spotify_db\",\"table\":\"seguidores\"},{\"db\":\"spotify_db\",\"table\":\"recomendaciones\"},{\"db\":\"spotify_db\",\"table\":\"pagos\"},{\"db\":\"ticket_system\",\"table\":\"eventos\"}]');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__relation`
--

CREATE TABLE `pma__relation` (
  `master_db` varchar(64) NOT NULL DEFAULT '',
  `master_table` varchar(64) NOT NULL DEFAULT '',
  `master_field` varchar(64) NOT NULL DEFAULT '',
  `foreign_db` varchar(64) NOT NULL DEFAULT '',
  `foreign_table` varchar(64) NOT NULL DEFAULT '',
  `foreign_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Relation table';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__savedsearches`
--

CREATE TABLE `pma__savedsearches` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `search_name` varchar(64) NOT NULL DEFAULT '',
  `search_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved searches';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__table_coords`
--

CREATE TABLE `pma__table_coords` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `pdf_page_number` int(11) NOT NULL DEFAULT 0,
  `x` float UNSIGNED NOT NULL DEFAULT 0,
  `y` float UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table coordinates for phpMyAdmin PDF output';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__table_info`
--

CREATE TABLE `pma__table_info` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `display_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__table_uiprefs`
--

CREATE TABLE `pma__table_uiprefs` (
  `username` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `prefs` text NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Tables'' UI preferences';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__tracking`
--

CREATE TABLE `pma__tracking` (
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `version` int(10) UNSIGNED NOT NULL,
  `date_created` datetime NOT NULL,
  `date_updated` datetime NOT NULL,
  `schema_snapshot` text NOT NULL,
  `schema_sql` text DEFAULT NULL,
  `data_sql` longtext DEFAULT NULL,
  `tracking` set('UPDATE','REPLACE','INSERT','DELETE','TRUNCATE','CREATE DATABASE','ALTER DATABASE','DROP DATABASE','CREATE TABLE','ALTER TABLE','RENAME TABLE','DROP TABLE','CREATE INDEX','DROP INDEX','CREATE VIEW','ALTER VIEW','DROP VIEW') DEFAULT NULL,
  `tracking_active` int(1) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Database changes tracking for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__userconfig`
--

CREATE TABLE `pma__userconfig` (
  `username` varchar(64) NOT NULL,
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `config_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User preferences storage for phpMyAdmin';

--
-- Volcado de datos para la tabla `pma__userconfig`
--

INSERT INTO `pma__userconfig` (`username`, `timevalue`, `config_data`) VALUES
('root', '2025-11-07 16:43:24', '{\"Console\\/Mode\":\"collapse\",\"lang\":\"es\"}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__usergroups`
--

CREATE TABLE `pma__usergroups` (
  `usergroup` varchar(64) NOT NULL,
  `tab` varchar(64) NOT NULL,
  `allowed` enum('Y','N') NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User groups with configured menu items';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__users`
--

CREATE TABLE `pma__users` (
  `username` varchar(64) NOT NULL,
  `usergroup` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Users and their assignments to user groups';

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pma__central_columns`
--
ALTER TABLE `pma__central_columns`
  ADD PRIMARY KEY (`db_name`,`col_name`);

--
-- Indices de la tabla `pma__column_info`
--
ALTER TABLE `pma__column_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `db_name` (`db_name`,`table_name`,`column_name`);

--
-- Indices de la tabla `pma__designer_settings`
--
ALTER TABLE `pma__designer_settings`
  ADD PRIMARY KEY (`username`);

--
-- Indices de la tabla `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_user_type_template` (`username`,`export_type`,`template_name`);

--
-- Indices de la tabla `pma__favorite`
--
ALTER TABLE `pma__favorite`
  ADD PRIMARY KEY (`username`);

--
-- Indices de la tabla `pma__history`
--
ALTER TABLE `pma__history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`,`db`,`table`,`timevalue`);

--
-- Indices de la tabla `pma__navigationhiding`
--
ALTER TABLE `pma__navigationhiding`
  ADD PRIMARY KEY (`username`,`item_name`,`item_type`,`db_name`,`table_name`);

--
-- Indices de la tabla `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  ADD PRIMARY KEY (`page_nr`),
  ADD KEY `db_name` (`db_name`);

--
-- Indices de la tabla `pma__recent`
--
ALTER TABLE `pma__recent`
  ADD PRIMARY KEY (`username`);

--
-- Indices de la tabla `pma__relation`
--
ALTER TABLE `pma__relation`
  ADD PRIMARY KEY (`master_db`,`master_table`,`master_field`),
  ADD KEY `foreign_field` (`foreign_db`,`foreign_table`);

--
-- Indices de la tabla `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_savedsearches_username_dbname` (`username`,`db_name`,`search_name`);

--
-- Indices de la tabla `pma__table_coords`
--
ALTER TABLE `pma__table_coords`
  ADD PRIMARY KEY (`db_name`,`table_name`,`pdf_page_number`);

--
-- Indices de la tabla `pma__table_info`
--
ALTER TABLE `pma__table_info`
  ADD PRIMARY KEY (`db_name`,`table_name`);

--
-- Indices de la tabla `pma__table_uiprefs`
--
ALTER TABLE `pma__table_uiprefs`
  ADD PRIMARY KEY (`username`,`db_name`,`table_name`);

--
-- Indices de la tabla `pma__tracking`
--
ALTER TABLE `pma__tracking`
  ADD PRIMARY KEY (`db_name`,`table_name`,`version`);

--
-- Indices de la tabla `pma__userconfig`
--
ALTER TABLE `pma__userconfig`
  ADD PRIMARY KEY (`username`);

--
-- Indices de la tabla `pma__usergroups`
--
ALTER TABLE `pma__usergroups`
  ADD PRIMARY KEY (`usergroup`,`tab`,`allowed`);

--
-- Indices de la tabla `pma__users`
--
ALTER TABLE `pma__users`
  ADD PRIMARY KEY (`username`,`usergroup`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pma__column_info`
--
ALTER TABLE `pma__column_info`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `pma__history`
--
ALTER TABLE `pma__history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  MODIFY `page_nr` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- Base de datos: `punto_venta`
--
CREATE DATABASE IF NOT EXISTS `punto_venta` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `punto_venta`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre`) VALUES
(1, 'Bebidas'),
(2, 'Snacks'),
(3, 'Electrónica');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `telefono` varchar(13) NOT NULL,
  `correo` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id_cliente`, `nombre`, `direccion`, `telefono`, `correo`) VALUES
(1, 'María Gómez', 'Col. Centro', '3129876543', 'maria@gomez.com'),
(2, 'Luis Torres', 'Col. Las Palmas', '3126543210', 'luis@torres.com');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `clientes_gasto_total`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `clientes_gasto_total` (
`id_cliente` int(11)
,`nombre` varchar(255)
,`direccion` varchar(255)
,`telefono` varchar(13)
,`correo` varchar(100)
,`total_ordenes` bigint(21)
,`total_gastado` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden`
--

CREATE TABLE `detalle_orden` (
  `id_detalle_orden` int(11) NOT NULL,
  `id_orden` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `detalle_orden`
--

INSERT INTO `detalle_orden` (`id_detalle_orden`, `id_orden`, `id_producto`, `precio_unitario`, `cantidad`, `subtotal`) VALUES
(1, 1, 1, 15.00, 1, 15.00),
(2, 1, 2, 12.50, 1, 12.50),
(3, 2, 3, 250.00, 1, 250.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE `empleados` (
  `id_empleado` int(11) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `telefono` varchar(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `empleados`
--

INSERT INTO `empleados` (`id_empleado`, `id_rol`, `nombre`, `direccion`, `telefono`) VALUES
(1, 1, 'Laura Ramírez', 'Av. Reforma 123', '3121234567'),
(2, 2, 'José Pérez', 'Calle Hidalgo 45', '3127654321');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id_producto` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `descripcion` text NOT NULL,
  `cantidad` int(11) NOT NULL,
  `codigo` varchar(100) NOT NULL,
  `id_categoria` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id_producto`, `nombre`, `precio`, `descripcion`, `cantidad`, `codigo`, `id_categoria`) VALUES
(1, 'Coca-Cola 600ml', 15.00, 'Refresco embotellado', 100, 'COCA600', 1),
(2, 'Papas Chips', 12.50, 'Bolsa de papas fritas', 50, 'CHIPS001', 2),
(3, 'Audífonos Bluetooth', 250.00, 'Audífonos inalámbricos', 20, 'BTHEAD01', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes`
--

CREATE TABLE `ordenes` (
  `id_orden` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `total` decimal(10,2) NOT NULL,
  `id_empleado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `ordenes`
--

INSERT INTO `ordenes` (`id_orden`, `id_cliente`, `fecha`, `total`, `id_empleado`) VALUES
(1, 1, '2025-09-03 16:39:37', 27.50, 2),
(2, 2, '2025-09-03 16:39:37', 250.00, 1);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `ordenes_mas_de_2_productos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `ordenes_mas_de_2_productos` (
`id_orden` int(11)
,`cliente` varchar(255)
,`empleado` varchar(255)
,`fecha` timestamp
,`total` decimal(10,2)
,`productos_distintos` bigint(21)
,`total_items` decimal(32,0)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `ordenes_ultimos_7_dias`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `ordenes_ultimos_7_dias` (
`id_orden` int(11)
,`cliente` varchar(255)
,`empleado` varchar(255)
,`fecha` timestamp
,`total` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `productos_no_vendidos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `productos_no_vendidos` (
`id_producto` int(11)
,`nombre` varchar(255)
,`precio` decimal(10,2)
,`descripcion` text
,`cantidad` int(11)
,`codigo` varchar(100)
,`categoria` varchar(100)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `productos_vendidos_precio_actual`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `productos_vendidos_precio_actual` (
`id_producto` int(11)
,`producto` varchar(255)
,`precio_venta` decimal(10,2)
,`precio_actual` decimal(10,2)
,`diferencia_precio` decimal(11,2)
,`categoria` varchar(100)
,`total_vendido` decimal(32,0)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL,
  `rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `rol`) VALUES
(1, 'Administrador'),
(2, 'Cajero'),
(3, 'Almacén');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_ordenes_clientes_empleados`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_ordenes_clientes_empleados` (
`id_orden` int(11)
,`fecha` timestamp
,`cliente` varchar(255)
,`empleado` varchar(255)
,`total` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `clientes_gasto_total`
--
DROP TABLE IF EXISTS `clientes_gasto_total`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `clientes_gasto_total`  AS SELECT `c`.`id_cliente` AS `id_cliente`, `c`.`nombre` AS `nombre`, `c`.`direccion` AS `direccion`, `c`.`telefono` AS `telefono`, `c`.`correo` AS `correo`, count(`o`.`id_orden`) AS `total_ordenes`, coalesce(sum(`o`.`total`),0) AS `total_gastado` FROM (`clientes` `c` left join `ordenes` `o` on(`c`.`id_cliente` = `o`.`id_cliente`)) GROUP BY `c`.`id_cliente`, `c`.`nombre`, `c`.`direccion`, `c`.`telefono`, `c`.`correo` ORDER BY coalesce(sum(`o`.`total`),0) DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `ordenes_mas_de_2_productos`
--
DROP TABLE IF EXISTS `ordenes_mas_de_2_productos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `ordenes_mas_de_2_productos`  AS SELECT `o`.`id_orden` AS `id_orden`, `c`.`nombre` AS `cliente`, `e`.`nombre` AS `empleado`, `o`.`fecha` AS `fecha`, `o`.`total` AS `total`, count(distinct `do`.`id_producto`) AS `productos_distintos`, sum(`do`.`cantidad`) AS `total_items` FROM (((`ordenes` `o` join `clientes` `c` on(`o`.`id_cliente` = `c`.`id_cliente`)) join `empleados` `e` on(`o`.`id_empleado` = `e`.`id_empleado`)) join `detalle_orden` `do` on(`o`.`id_orden` = `do`.`id_orden`)) GROUP BY `o`.`id_orden`, `c`.`nombre`, `e`.`nombre`, `o`.`fecha`, `o`.`total` HAVING count(distinct `do`.`id_producto`) > 2 ORDER BY count(distinct `do`.`id_producto`) DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `ordenes_ultimos_7_dias`
--
DROP TABLE IF EXISTS `ordenes_ultimos_7_dias`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `ordenes_ultimos_7_dias`  AS SELECT `o`.`id_orden` AS `id_orden`, `c`.`nombre` AS `cliente`, `e`.`nombre` AS `empleado`, `o`.`fecha` AS `fecha`, `o`.`total` AS `total` FROM ((`ordenes` `o` join `clientes` `c` on(`o`.`id_cliente` = `c`.`id_cliente`)) join `empleados` `e` on(`o`.`id_empleado` = `e`.`id_empleado`)) WHERE `o`.`fecha` >= curdate() - interval 7 day ORDER BY `o`.`fecha` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `productos_no_vendidos`
--
DROP TABLE IF EXISTS `productos_no_vendidos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `productos_no_vendidos`  AS SELECT `i`.`id_producto` AS `id_producto`, `i`.`nombre` AS `nombre`, `i`.`precio` AS `precio`, `i`.`descripcion` AS `descripcion`, `i`.`cantidad` AS `cantidad`, `i`.`codigo` AS `codigo`, `c`.`nombre` AS `categoria` FROM (`inventario` `i` join `categorias` `c` on(`i`.`id_categoria` = `c`.`id_categoria`)) WHERE !(`i`.`id_producto` in (select distinct `detalle_orden`.`id_producto` from `detalle_orden`)) ORDER BY `i`.`nombre` ASC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `productos_vendidos_precio_actual`
--
DROP TABLE IF EXISTS `productos_vendidos_precio_actual`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `productos_vendidos_precio_actual`  AS SELECT `do`.`id_producto` AS `id_producto`, `i`.`nombre` AS `producto`, `do`.`precio_unitario` AS `precio_venta`, `i`.`precio` AS `precio_actual`, `i`.`precio`- `do`.`precio_unitario` AS `diferencia_precio`, `c`.`nombre` AS `categoria`, sum(`do`.`cantidad`) AS `total_vendido` FROM ((`detalle_orden` `do` join `inventario` `i` on(`do`.`id_producto` = `i`.`id_producto`)) join `categorias` `c` on(`i`.`id_categoria` = `c`.`id_categoria`)) GROUP BY `do`.`id_producto`, `i`.`nombre`, `do`.`precio_unitario`, `i`.`precio`, `c`.`nombre` ORDER BY `i`.`nombre` ASC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_ordenes_clientes_empleados`
--
DROP TABLE IF EXISTS `vw_ordenes_clientes_empleados`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_ordenes_clientes_empleados`  AS SELECT `o`.`id_orden` AS `id_orden`, `o`.`fecha` AS `fecha`, `c`.`nombre` AS `cliente`, `e`.`nombre` AS `empleado`, `o`.`total` AS `total` FROM ((`ordenes` `o` join `clientes` `c` on(`o`.`id_cliente` = `c`.`id_cliente`)) join `empleados` `e` on(`o`.`id_empleado` = `e`.`id_empleado`)) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indices de la tabla `detalle_orden`
--
ALTER TABLE `detalle_orden`
  ADD PRIMARY KEY (`id_detalle_orden`),
  ADD KEY `id_orden` (`id_orden`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD PRIMARY KEY (`id_empleado`),
  ADD KEY `id_rol` (`id_rol`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `id_categoria` (`id_categoria`);

--
-- Indices de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD PRIMARY KEY (`id_orden`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_empleado` (`id_empleado`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `detalle_orden`
--
ALTER TABLE `detalle_orden`
  MODIFY `id_detalle_orden` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `id_empleado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  MODIFY `id_orden` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_orden`
--
ALTER TABLE `detalle_orden`
  ADD CONSTRAINT `detalle_orden_ibfk_1` FOREIGN KEY (`id_orden`) REFERENCES `ordenes` (`id_orden`),
  ADD CONSTRAINT `detalle_orden_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `inventario` (`id_producto`);

--
-- Filtros para la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD CONSTRAINT `empleados_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`),
  ADD CONSTRAINT `fk_empleados_roles` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`);

--
-- Filtros para la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD CONSTRAINT `ordenes_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  ADD CONSTRAINT `ordenes_ibfk_2` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id_empleado`);
--
-- Base de datos: `spotify_db`
--
CREATE DATABASE IF NOT EXISTS `spotify_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `spotify_db`;

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
(1, 'Un Verano Sin Ti', 1, '2022-05-06', NULL, 'Reggaeton'),
(2, 'Midnights', 2, '2022-10-21', NULL, 'Pop'),
(3, 'After Hours', 3, '2020-03-20', NULL, 'R&B'),
(4, 'Las Mujeres Ya No Lloran', 4, '2024-03-22', NULL, 'Pop'),
(5, 'Divide', 5, '2017-03-03', NULL, 'Pop');

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
(1, 'Bad Bunny', 1, NULL, '2020-05-15', 0, 2, NULL),
(2, 'Taylor Swift', 1, NULL, '2018-03-10', 0, 2, NULL),
(3, 'The Weeknd', 1, NULL, '2019-07-22', 0, 2, NULL),
(4, 'Shakira', 1, NULL, '2015-01-20', 0, 2, NULL),
(5, 'Ed Sheeran', 1, NULL, '2017-08-14', 0, 2, NULL);

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
(1, 'Tití Me Preguntó', 240, 1, 1, 1500, NULL, 'titi_me_pregunto.mp3', NULL, 0),
(2, 'Anti-Hero', 200, 2, 2, 1800, NULL, 'anti_hero.mp3', NULL, 0),
(3, 'Blinding Lights', 210, 3, 3, 2200, NULL, 'blinding_lights.mp3', NULL, 0),
(4, 'Me Porto Bonito', 180, 1, 1, 1200, NULL, 'me_porto_bonito.mp3', NULL, 0),
(5, 'Lavender Haze', 195, 2, 2, 900, NULL, 'lavender_haze.mp3', NULL, 0),
(6, 'Save Your Tears', 215, 3, 3, 1100, NULL, 'save_your_tears.mp3', NULL, 0),
(7, 'BZRP Music Sessions #53', 245, 4, 4, 2000, NULL, 'bzrp_session_53.mp3', NULL, 0),
(8, 'Shape of You', 235, 5, 5, 2500, NULL, 'shape_of_you.mp3', NULL, 0),
(9, 'ola', 1, 2, 3, 0, '2025-11-06', '690d0cfea5a33.wav', 'a', 1);

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
  `tipo_cuenta` enum('Free','Premium') DEFAULT 'Free',
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
(13, 'Alejandro Rodriguez', 'test@email.com', '$2y$10$HTqezdHyRuZDdaeoUiXCpeXAAIw/aUE08d0COeaU6AQn7y8sQX10i', '', '2025-11-07', 'Free', 0.00, '1990-01-01', '2025-11-07 10:50:10', 'Desconocido', 1);

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
  MODIFY `id_album` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `artista`
--
ALTER TABLE `artista`
  MODIFY `id_artista` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `cancion`
--
ALTER TABLE `cancion`
  MODIFY `id_cancion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
  MODIFY `id_playlist` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
