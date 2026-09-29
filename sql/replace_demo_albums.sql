-- ===========================================================================
-- Replace the demo album catalogue with real albums.
--
--   before: 13 demo albums (Toxicity + 12 from seed_demo.sql)
--   after:  12 real albums
--
-- Songs are NOT deleted: cancion.id_album is ON DELETE SET NULL, so the demo
-- tracks survive with no album attached. Delete them separately if unwanted.
--
-- System Of A Down already exists (id 6) and is reused; the other seven
-- artists are created here.
--
-- Safe to run more than once: it clears its own id range first.
-- ===========================================================================

SET NAMES utf8mb4;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- Remove a previous run of this seed (ids 1013+) so re-running is clean.
DELETE FROM album  WHERE id_album  >= 1013;
DELETE FROM artista WHERE id_artista >= 1013;

-- 1. Artists the new albums need. System Of A Down (id 6) already exists.
INSERT INTO artista
  (id_artista, nombre_artista, verificado, biografia, fecha_registro, reproducciones_totales, seguidores, foto_perfil)
VALUES
  (1013, 'Radiohead',     1, NULL, NULL, 0, 0, NULL),
  (1014, 'Black Sabbath', 1, NULL, NULL, 0, 0, NULL),
  (1015, 'Pantera',       1, NULL, NULL, 0, 0, NULL),
  (1016, 'Megadeth',      1, NULL, NULL, 0, 0, NULL),
  (1017, 'Nirvana',       1, NULL, NULL, 0, 0, NULL),
  (1018, 'Deftones',      1, NULL, NULL, 0, 0, NULL),
  (1019, 'Gorillaz',      1, NULL, NULL, 0, 0, NULL);

-- 2. Drop every demo album. Their songs stay, with id_album set to NULL.
DELETE FROM album;

-- 3. The replacement albums.
INSERT INTO album (id_album, titulo, id_artista, fecha_lanzamiento, genero) VALUES
  (1013, 'OK Computer',               1013, '1997-05-21', 'Alternative rock'),
  (1014, 'Paranoid',                  1014, '1970-09-18', 'Heavy metal'),
  (1015, 'System of a Down',          6,    '1998-06-30', 'Alternative metal'),
  (1016, 'Steal This Album!',         6,    '2002-11-26', 'Alternative metal'),
  (1017, 'Mezmerize',                 6,    '2005-05-17', 'Alternative metal'),
  (1018, 'Hypnotize',                 6,    '2005-11-22', 'Alternative metal'),
  (1019, 'Vulgar Display of Power',   1015, '1992-02-25', 'Groove metal'),
  (1020, 'Rust in Peace',             1016, '1990-09-24', 'Thrash metal'),
  (1021, 'Nevermind',                 1017, '1991-09-24', 'Grunge'),
  (1022, 'Black Sabbath',             1014, '1970-02-13', 'Heavy metal'),
  (1023, 'Around the Fur',            1018, '1997-10-28', 'Alternative metal'),
  (1024, 'Demon Days',                1019, '2005-05-11', 'Alternative rock');

-- 4. Report.
SELECT a.id_album, a.titulo, ar.nombre_artista, a.genero, a.fecha_lanzamiento
  FROM album a
  JOIN artista ar ON ar.id_artista = a.id_artista
 ORDER BY a.id_album;

SELECT COUNT(*) AS albums_now FROM album;
SELECT COUNT(*) AS songs_without_album FROM cancion WHERE id_album IS NULL;
