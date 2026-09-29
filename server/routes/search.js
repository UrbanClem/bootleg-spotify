const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Search songs
router.get('/songs', authenticateToken, async (req, res) => {
    try {
        const q = req.query.q || '';
        const searchTerm = `%${q}%`;

        const [rows] = await pool.query(`
            SELECT c.id_cancion, c.titulo, c.duracion, c.popularidad,
                   c.fecha_lanzamiento, c.archivo_audio, c.explicit,
                   a.nombre_artista, al.titulo as titulo_album, al.portada as portada_album
            FROM cancion c
            LEFT JOIN artista a ON c.id_artista = a.id_artista
            LEFT JOIN album al ON c.id_album = al.id_album
            WHERE c.titulo LIKE ? OR a.nombre_artista LIKE ?
            ORDER BY c.popularidad DESC
        `, [searchTerm, searchTerm]);

        res.json(rows);
    } catch (error) {
        console.error('Search songs error:', error);
        res.status(500).json({ error: 'Error en la búsqueda' });
    }
});

// Search albums
router.get('/albums', authenticateToken, async (req, res) => {
    try {
        const q = req.query.q || '';
        const searchTerm = `%${q}%`;

        const [rows] = await pool.query(`
            SELECT a.id_album, a.titulo, a.fecha_lanzamiento, a.portada, a.genero,
                   ar.nombre_artista,
                   COUNT(c.id_cancion) as total_canciones
            FROM album a
            LEFT JOIN artista ar ON a.id_artista = ar.id_artista
            LEFT JOIN cancion c ON a.id_album = c.id_album
            WHERE a.titulo LIKE ? OR ar.nombre_artista LIKE ? OR a.genero LIKE ?
            GROUP BY a.id_album
            ORDER BY a.fecha_lanzamiento DESC
        `, [searchTerm, searchTerm, searchTerm]);

        res.json(rows);
    } catch (error) {
        console.error('Search albums error:', error);
        res.status(500).json({ error: 'Error en la búsqueda' });
    }
});

// Search artists
router.get('/artists', authenticateToken, async (req, res) => {
    try {
        const q = req.query.q || '';
        const searchTerm = `%${q}%`;

        const [rows] = await pool.query(`
            SELECT a.*, COUNT(c.id_cancion) as total_canciones
            FROM artista a
            LEFT JOIN cancion c ON a.id_artista = c.id_artista
            WHERE a.nombre_artista LIKE ? OR a.biografia LIKE ?
            GROUP BY a.id_artista
            ORDER BY a.seguidores DESC
        `, [searchTerm, searchTerm]);

        res.json(rows);
    } catch (error) {
        console.error('Search artists error:', error);
        res.status(500).json({ error: 'Error en la búsqueda' });
    }
});

module.exports = router;
