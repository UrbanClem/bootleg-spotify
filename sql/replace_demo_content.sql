-- ===========================================================================
-- Finish replacing the demo content with the real catalogue.
--
--   before: 24 artists (12 unused, 11 fake demo, 1 real), 31 orphaned demo
--           songs, 5 demo playlists
--   after:  8 artists (System Of A Down + the 7 album artists), 140 real
--           tracks across the 12 albums, 3 new playlists
--
-- Songs are inserted with archivo_audio = '' (no audio file). Only the
-- pre-existing "Prison Song" keeps its audio.
--
-- Safe to run more than once: it clears its own id ranges first.
-- ===========================================================================

SET NAMES utf8mb4;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- Remove a previous run of this seed so re-running is clean.
DELETE FROM playlist_cancion WHERE id_playlist >= 3006;
DELETE FROM playlist       WHERE id_playlist >= 3006;
DELETE FROM cancion        WHERE id_cancion  >= 1031;
DELETE FROM artista        WHERE id_artista  IN (2, 3, 4, 5, 1010, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1011, 1012);

-- 1. Drop the demo playlists. Cascades to playlist_cancion.
DELETE FROM playlist WHERE id_playlist IN (1001, 1002, 1003, 1004, 1005);

-- 2. Drop the unused and fake demo artists. Cascades to their songs.
--    System Of A Down (6) and the seven album artists (1013-1019) survive.
DELETE FROM artista WHERE id_artista IN (2, 3, 4, 5, 1010, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1011, 1012);

-- 3. The real tracklists. No audio: archivo_audio is ''.
INSERT INTO cancion
  (id_cancion, titulo, duracion, id_artista, id_album, popularidad, fecha_lanzamiento, archivo_audio, letra, explicit)
VALUES
(1031, 'Airbag', 244, 1013, 1013, 0, '1997-05-21', '', NULL, 0),
(1032, 'Paranoid Android', 386, 1013, 1013, 0, '1997-05-21', '', NULL, 0),
(1033, 'Subterranean Homesick Alien', 277, 1013, 1013, 0, '1997-05-21', '', NULL, 0),
(1034, 'Exit Music (For a Film)', 258, 1013, 1013, 0, '1997-05-21', '', NULL, 0),
(1035, 'Let Down', 299, 1013, 1013, 0, '1997-05-21', '', NULL, 0),
(1036, 'Karma Police', 264, 1013, 1013, 0, '1997-05-21', '', NULL, 0),
(1037, 'Fitter Happier', 117, 1013, 1013, 0, '1997-05-21', '', NULL, 0),
(1038, 'Electioneering', 234, 1013, 1013, 0, '1997-05-21', '', NULL, 0),
(1039, 'Climbing Up the Walls', 282, 1013, 1013, 0, '1997-05-21', '', NULL, 0),
(1040, 'No Surprises', 229, 1013, 1013, 0, '1997-05-21', '', NULL, 0),
(1041, 'Lucky', 271, 1013, 1013, 0, '1997-05-21', '', NULL, 0),
(1042, 'The Tourist', 323, 1013, 1013, 0, '1997-05-21', '', NULL, 0),
(1043, 'War Pigs', 478, 1014, 1014, 0, '1970-09-18', '', NULL, 0),
(1044, 'Paranoid', 172, 1014, 1014, 0, '1970-09-18', '', NULL, 0),
(1045, 'Planet Caravan', 284, 1014, 1014, 0, '1970-09-18', '', NULL, 0),
(1046, 'Iron Man', 356, 1014, 1014, 0, '1970-09-18', '', NULL, 0),
(1047, 'Electric Funeral', 293, 1014, 1014, 0, '1970-09-18', '', NULL, 0),
(1048, 'Hand of Doom', 428, 1014, 1014, 0, '1970-09-18', '', NULL, 0),
(1049, 'Rat Salad', 150, 1014, 1014, 0, '1970-09-18', '', NULL, 0),
(1050, 'Fairies Wear Boots', 384, 1014, 1014, 0, '1970-09-18', '', NULL, 0),
(1051, 'Suite-Pee', 160, 6, 1015, 0, '1998-06-30', '', NULL, 1),
(1052, 'Know', 186, 6, 1015, 0, '1998-06-30', '', NULL, 1),
(1053, 'Sugar', 153, 6, 1015, 0, '1998-06-30', '', NULL, 1),
(1054, 'Suggestions', 235, 6, 1015, 0, '1998-06-30', '', NULL, 1),
(1055, 'Spiders', 205, 6, 1015, 0, '1998-06-30', '', NULL, 1),
(1056, 'DDevil', 110, 6, 1015, 0, '1998-06-30', '', NULL, 1),
(1057, 'Soil', 204, 6, 1015, 0, '1998-06-30', '', NULL, 1),
(1058, 'War?', 130, 6, 1015, 0, '1998-06-30', '', NULL, 1),
(1059, 'Mind', 395, 6, 1015, 0, '1998-06-30', '', NULL, 1),
(1060, 'Peephole', 250, 6, 1015, 0, '1998-06-30', '', NULL, 1),
(1061, 'CUBErt', 128, 6, 1015, 0, '1998-06-30', '', NULL, 1),
(1062, 'Darts', 122, 6, 1015, 0, '1998-06-30', '', NULL, 1),
(1063, 'P.L.U.C.K.', 230, 6, 1015, 0, '1998-06-30', '', NULL, 1),
(1064, 'Chic \'n\' Stu', 133, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1065, 'Innervision', 132, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1066, 'Bubbles', 118, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1067, 'Boom!', 166, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1068, 'Nüguns', 190, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1069, 'A.D.D.', 210, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1070, 'Mr. Jack', 248, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1071, 'I-A-X-I-D', 110, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1072, '36', 270, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1073, 'Pictures', 120, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1074, 'Highway Song', 210, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1075, 'Fuck the System', 160, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1076, 'Ego Brain', 220, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1077, 'Thetawaves', 170, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1078, 'Roulette', 200, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1079, 'Streamline', 220, 6, 1016, 0, '2002-11-26', '', NULL, 1),
(1080, 'Soldier Side', 220, 6, 1017, 0, '2005-05-17', '', NULL, 1),
(1081, 'B.Y.O.B.', 254, 6, 1017, 0, '2005-05-17', '', NULL, 1),
(1082, 'Revenga', 220, 6, 1017, 0, '2005-05-17', '', NULL, 1),
(1083, 'Cigaro', 130, 6, 1017, 0, '2005-05-17', '', NULL, 1),
(1084, 'Radio/Video', 240, 6, 1017, 0, '2005-05-17', '', NULL, 1),
(1085, 'This Cocaine Makes Me Feel Like I\'m on This Song', 140, 6, 1017, 0, '2005-05-17', '', NULL, 1),
(1086, 'Violent Pornography', 210, 6, 1017, 0, '2005-05-17', '', NULL, 1),
(1087, 'Question!', 200, 6, 1017, 0, '2005-05-17', '', NULL, 1),
(1088, 'Sad Statue', 200, 6, 1017, 0, '2005-05-17', '', NULL, 1),
(1089, 'Old School Hollywood', 180, 6, 1017, 0, '2005-05-17', '', NULL, 1),
(1090, 'Lost in Hollywood', 240, 6, 1017, 0, '2005-05-17', '', NULL, 1),
(1091, 'Attack', 190, 6, 1018, 0, '2005-11-22', '', NULL, 1),
(1092, 'Dreaming', 240, 6, 1018, 0, '2005-11-22', '', NULL, 1),
(1093, 'Kill Rock \'n Roll', 150, 6, 1018, 0, '2005-11-22', '', NULL, 1),
(1094, 'Hypnotize', 200, 6, 1018, 0, '2005-11-22', '', NULL, 1),
(1095, 'Stealing Society', 170, 6, 1018, 0, '2005-11-22', '', NULL, 1),
(1096, 'Tentative', 220, 6, 1018, 0, '2005-11-22', '', NULL, 1),
(1097, 'U-Fig', 180, 6, 1018, 0, '2005-11-22', '', NULL, 1),
(1098, 'Holy Mountains', 320, 6, 1018, 0, '2005-11-22', '', NULL, 1),
(1099, 'Vicinity of Obscenity', 170, 6, 1018, 0, '2005-11-22', '', NULL, 1),
(1100, 'She\'s Like Heroin', 160, 6, 1018, 0, '2005-11-22', '', NULL, 1),
(1101, 'Lonely Day', 170, 6, 1018, 0, '2005-11-22', '', NULL, 1),
(1102, 'Soldier Side - Intro', 120, 6, 1018, 0, '2005-11-22', '', NULL, 1),
(1103, 'Mouth for War', 230, 1015, 1019, 0, '1992-02-25', '', NULL, 1),
(1104, 'A New Level', 230, 1015, 1019, 0, '1992-02-25', '', NULL, 1),
(1105, 'Walk', 310, 1015, 1019, 0, '1992-02-25', '', NULL, 1),
(1106, 'Fucking Hostile', 160, 1015, 1019, 0, '1992-02-25', '', NULL, 1),
(1107, 'This Love', 370, 1015, 1019, 0, '1992-02-25', '', NULL, 1),
(1108, 'Rise', 280, 1015, 1019, 0, '1992-02-25', '', NULL, 1),
(1109, 'No Good (Attack the Radical)', 290, 1015, 1019, 0, '1992-02-25', '', NULL, 1),
(1110, 'Live in a Hole', 300, 1015, 1019, 0, '1992-02-25', '', NULL, 1),
(1111, 'Regular People (Conceit)', 320, 1015, 1019, 0, '1992-02-25', '', NULL, 1),
(1112, 'By Demons Be Driven', 290, 1015, 1019, 0, '1992-02-25', '', NULL, 1),
(1113, 'Hollow', 320, 1015, 1019, 0, '1992-02-25', '', NULL, 1),
(1114, 'I\'m Broken', 270, 1015, 1019, 0, '1992-02-25', '', NULL, 1),
(1115, '5 Minutes Alone', 350, 1015, 1019, 0, '1992-02-25', '', NULL, 1),
(1116, 'Throes of Rejection', 300, 1015, 1019, 0, '1992-02-25', '', NULL, 1),
(1117, 'Piss', 350, 1015, 1019, 0, '1992-02-25', '', NULL, 1),
(1118, 'Holy Wars... The Punishment Due', 390, 1016, 1020, 0, '1990-09-24', '', NULL, 0),
(1119, 'Hangar 18', 310, 1016, 1020, 0, '1990-09-24', '', NULL, 0),
(1120, 'Take No Prisoners', 200, 1016, 1020, 0, '1990-09-24', '', NULL, 0),
(1121, 'Five Magics', 320, 1016, 1020, 0, '1990-09-24', '', NULL, 0),
(1122, 'Poison Was the Cure', 170, 1016, 1020, 0, '1990-09-24', '', NULL, 0),
(1123, 'Lucretia', 230, 1016, 1020, 0, '1990-09-24', '', NULL, 0),
(1124, 'Tornado of Souls', 310, 1016, 1020, 0, '1990-09-24', '', NULL, 0),
(1125, 'Dawn Patrol', 100, 1016, 1020, 0, '1990-09-24', '', NULL, 0),
(1126, 'Rust in Peace... Polaris', 340, 1016, 1020, 0, '1990-09-24', '', NULL, 0),
(1127, 'Smells Like Teen Spirit', 295, 1017, 1021, 0, '1991-09-24', '', NULL, 0),
(1128, 'In Bloom', 255, 1017, 1021, 0, '1991-09-24', '', NULL, 0),
(1129, 'Come as You Are', 219, 1017, 1021, 0, '1991-09-24', '', NULL, 0),
(1130, 'Breed', 184, 1017, 1021, 0, '1991-09-24', '', NULL, 0),
(1131, 'Lithium', 257, 1017, 1021, 0, '1991-09-24', '', NULL, 0),
(1132, 'Polly', 174, 1017, 1021, 0, '1991-09-24', '', NULL, 0),
(1133, 'Territorial Pissings', 142, 1017, 1021, 0, '1991-09-24', '', NULL, 0),
(1134, 'Drain You', 224, 1017, 1021, 0, '1991-09-24', '', NULL, 0),
(1135, 'Lounge Act', 156, 1017, 1021, 0, '1991-09-24', '', NULL, 0),
(1136, 'Stay Away', 212, 1017, 1021, 0, '1991-09-24', '', NULL, 0),
(1137, 'On a Plain', 196, 1017, 1021, 0, '1991-09-24', '', NULL, 0),
(1138, 'Something in the Way', 232, 1017, 1021, 0, '1991-09-24', '', NULL, 0),
(1139, 'Black Sabbath', 390, 1014, 1022, 0, '1970-02-13', '', NULL, 0),
(1140, 'The Wizard', 260, 1014, 1022, 0, '1970-02-13', '', NULL, 0),
(1141, 'Behind the Wall of Sleep', 220, 1014, 1022, 0, '1970-02-13', '', NULL, 0),
(1142, 'N.I.B.', 370, 1014, 1022, 0, '1970-02-13', '', NULL, 0),
(1143, 'Evil Woman', 200, 1014, 1022, 0, '1970-02-13', '', NULL, 0),
(1144, 'Sleeping Village', 220, 1014, 1022, 0, '1970-02-13', '', NULL, 0),
(1145, 'Warning', 620, 1014, 1022, 0, '1970-02-13', '', NULL, 0),
(1146, 'My Own Summer (Shove It)', 220, 1018, 1023, 0, '1997-10-28', '', NULL, 0),
(1147, 'Lhabia', 240, 1018, 1023, 0, '1997-10-28', '', NULL, 0),
(1148, 'Mascara', 240, 1018, 1023, 0, '1997-10-28', '', NULL, 0),
(1149, 'Around the Fur', 220, 1018, 1023, 0, '1997-10-28', '', NULL, 0),
(1150, 'Rickets', 200, 1018, 1023, 0, '1997-10-28', '', NULL, 0),
(1151, 'Be Quiet and Drive (Far Away)', 300, 1018, 1023, 0, '1997-10-28', '', NULL, 0),
(1152, 'Lotion', 200, 1018, 1023, 0, '1997-10-28', '', NULL, 0),
(1153, 'Dai the Flu', 250, 1018, 1023, 0, '1997-10-28', '', NULL, 0),
(1154, 'Headup', 330, 1018, 1023, 0, '1997-10-28', '', NULL, 0),
(1155, 'MX', 280, 1018, 1023, 0, '1997-10-28', '', NULL, 0),
(1156, 'Intro', 60, 1019, 1024, 0, '2005-05-11', '', NULL, 0),
(1157, 'Last Living Souls', 200, 1019, 1024, 0, '2005-05-11', '', NULL, 0),
(1158, 'Kids with Guns', 230, 1019, 1024, 0, '2005-05-11', '', NULL, 0),
(1159, 'O Green World', 270, 1019, 1024, 0, '2005-05-11', '', NULL, 0),
(1160, 'Dirty Harry', 230, 1019, 1024, 0, '2005-05-11', '', NULL, 0),
(1161, 'Feel Good Inc.', 220, 1019, 1024, 0, '2005-05-11', '', NULL, 0),
(1162, 'El Mañana', 240, 1019, 1024, 0, '2005-05-11', '', NULL, 0),
(1163, 'Every Planet We Reach Is Dead', 290, 1019, 1024, 0, '2005-05-11', '', NULL, 0),
(1164, 'November Has Come', 170, 1019, 1024, 0, '2005-05-11', '', NULL, 0),
(1165, 'All Alone', 200, 1019, 1024, 0, '2005-05-11', '', NULL, 0),
(1166, 'White Light', 140, 1019, 1024, 0, '2005-05-11', '', NULL, 0),
(1167, 'DARE', 240, 1019, 1024, 0, '2005-05-11', '', NULL, 0),
(1168, 'Fire Coming Out of the Monkey\'s Head', 190, 1019, 1024, 0, '2005-05-11', '', NULL, 0),
(1169, 'Don\'t Get Lost in Heaven', 120, 1019, 1024, 0, '2005-05-11', '', NULL, 0),
(1170, 'Demon Days', 270, 1019, 1024, 0, '2005-05-11', '', NULL, 0);

-- 4. Playlists replacing the demo ones.
INSERT INTO playlist (id_playlist, nombre_playlist, id_usuario, descripcion, fecha_creacion, privada, portada)
VALUES
(3006, 'Metal Essentials', 13, 'Heavy riffs across four decades.', NOW(), 0, NULL),
(3007, '90s Alternative', 13, 'Grunge, britpop and the fur.', NOW(), 0, NULL),
(3008, 'Eclectic Mix', 13, 'A little bit of everything.', NOW(), 0, NULL);

-- 5. Their tracks.
INSERT INTO playlist_cancion (id_playlist, id_cancion, orden, fecha_agregado)
VALUES
(3006, 1043, 1, NOW()),
(3006, 1046, 2, NOW()),
(3006, 1139, 3, NOW()),
(3006, 1118, 4, NOW()),
(3006, 1124, 5, NOW()),
(3006, 1103, 6, NOW()),
(3006, 1105, 7, NOW()),
(3006, 1081, 8, NOW()),
(3006, 1098, 9, NOW()),
(3006, 1063, 10, NOW()),
(3007, 1127, 1, NOW()),
(3007, 1129, 2, NOW()),
(3007, 1135, 3, NOW()),
(3007, 1032, 4, NOW()),
(3007, 1036, 5, NOW()),
(3007, 1040, 6, NOW()),
(3007, 1146, 7, NOW()),
(3007, 1151, 8, NOW()),
(3007, 1154, 9, NOW()),
(3008, 1161, 1, NOW()),
(3008, 1167, 2, NOW()),
(3008, 1170, 3, NOW()),
(3008, 1042, 4, NOW()),
(3008, 1041, 5, NOW()),
(3008, 1087, 6, NOW()),
(3008, 1090, 7, NOW()),
(3008, 1138, 8, NOW()),
(3008, 1126, 9, NOW()),
(3008, 1155, 10, NOW());

-- 6. Report.
SELECT (SELECT COUNT(*) FROM artista) artists,
       (SELECT COUNT(*) FROM album)   albums,
       (SELECT COUNT(*) FROM cancion)  songs,
       (SELECT COUNT(*) FROM playlist) playlists;

SELECT a.id_album, a.titulo, COUNT(c.id_cancion) tracks
  FROM album a LEFT JOIN cancion c ON c.id_album = a.id_album
 GROUP BY a.id_album, a.titulo ORDER BY a.id_album;
