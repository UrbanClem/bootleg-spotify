const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all albums
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT a.id_album, a.titulo, a.fecha_lanzamiento, a.portada, a.genero,
                   ar.nombre_artista,
                   COUNT(c.id_cancion) as total_canciones
            FROM album a
            LEFT JOIN artista ar ON a.id_artista = ar.id_artista
            LEFT JOIN cancion c ON a.id_album = c.id_album
            GROUP BY a.id_album
            ORDER BY a.fecha_lanzamiento DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Get albums error:', error);
        res.status(500).json({ error: 'Error al obtener álbumes' });
    }
});

// Get album by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT a.id_album, a.titulo, a.id_artista, a.fecha_lanzamiento,
                   a.portada, a.genero, ar.nombre_artista
            FROM album a
            LEFT JOIN artista ar ON a.id_artista = ar.id_artista
            WHERE a.id_album = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Álbum no encontrado' });
        }

        // Get songs in album
        const [songs] = await pool.query(`
            SELECT c.id_cancion, c.titulo, c.duracion, c.popularidad, c.archivo_audio, c.explicit,
                   c.id_artista, c.id_album, c.fecha_lanzamiento,
                   ar.nombre_artista, al.portada as portada_album
            FROM cancion c
            LEFT JOIN artista ar ON c.id_artista = ar.id_artista
            LEFT JOIN album al ON c.id_album = al.id_album
            WHERE c.id_album = ?
            ORDER BY c.titulo
        `, [req.params.id]);

        res.json({ ...rows[0], canciones: songs });
    } catch (error) {
        console.error('Get album error:', error);
        res.status(500).json({ error: 'Error al obtener álbum' });
    }
});

// Create album (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { titulo, id_artista, fecha_lanzamiento, portada, genero } = req.body;

        const [result] = await pool.query(
            'INSERT INTO album (titulo, id_artista, fecha_lanzamiento, portada, genero) VALUES (?, ?, ?, ?, ?)',
            [titulo, id_artista, fecha_lanzamiento, portada || null, genero]
        );

        res.status(201).json({ message: 'Álbum creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Create album error:', error);
        res.status(500).json({ error: 'Error al crear álbum' });
    }
});

// Update album (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { titulo, id_artista, fecha_lanzamiento, portada, genero } = req.body;

        await pool.query(
            'UPDATE album SET titulo = ?, id_artista = ?, fecha_lanzamiento = ?, portada = ?, genero = ? WHERE id_album = ?',
            [titulo, id_artista, fecha_lanzamiento, portada || null, genero, req.params.id]
        );

        res.json({ message: 'Álbum actualizado exitosamente' });
    } catch (error) {
        console.error('Update album error:', error);
        res.status(500).json({ error: 'Error al actualizar álbum' });
    }
});

// Delete album (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM album WHERE id_album = ?', [req.params.id]);
        res.json({ message: 'Álbum eliminado exitosamente' });
    } catch (error) {
        console.error('Delete album error:', error);
        res.status(500).json({ error: 'Error al eliminar álbum' });
    }
});

module.exports = router;
