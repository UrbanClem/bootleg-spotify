const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all artists
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT a.*, COUNT(c.id_cancion) as total_canciones
            FROM artista a
            LEFT JOIN cancion c ON a.id_artista = c.id_artista
            GROUP BY a.id_artista
            ORDER BY a.seguidores DESC, a.nombre_artista ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Get artists error:', error);
        res.status(500).json({ error: 'Error al obtener artistas' });
    }
});

// Get artist by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM artista WHERE id_artista = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Artista no encontrado' });
        }

        const [songs] = await pool.query(`
            SELECT c.id_cancion, c.titulo, c.duracion, c.popularidad, c.archivo_audio, c.explicit,
                   al.titulo as titulo_album, al.portada as portada_album
            FROM cancion c
            LEFT JOIN album al ON c.id_album = al.id_album
            WHERE c.id_artista = ?
            ORDER BY c.popularidad DESC
        `, [req.params.id]);

        res.json({ ...rows[0], canciones: songs });
    } catch (error) {
        console.error('Get artist error:', error);
        res.status(500).json({ error: 'Error al obtener artista' });
    }
});

// Create artist (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { nombre_artista, verificado, biografia, foto_perfil } = req.body;

        const [result] = await pool.query(
            'INSERT INTO artista (nombre_artista, verificado, biografia, foto_perfil, fecha_registro) VALUES (?, ?, ?, ?, CURDATE())',
            [nombre_artista, verificado ? 1 : 0, biografia || '', foto_perfil || null]
        );

        res.status(201).json({ message: 'Artista creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Create artist error:', error);
        res.status(500).json({ error: 'Error al crear artista' });
    }
});

// Update artist (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { nombre_artista, verificado, biografia, foto_perfil } = req.body;

        await pool.query(
            'UPDATE artista SET nombre_artista = ?, verificado = ?, biografia = ?, foto_perfil = ? WHERE id_artista = ?',
            [nombre_artista, verificado ? 1 : 0, biografia || '', foto_perfil || null, req.params.id]
        );

        res.json({ message: 'Artista actualizado exitosamente' });
    } catch (error) {
        console.error('Update artist error:', error);
        res.status(500).json({ error: 'Error al actualizar artista' });
    }
});

// Delete artist (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM artista WHERE id_artista = ?', [req.params.id]);
        res.json({ message: 'Artista eliminado exitosamente' });
    } catch (error) {
        console.error('Delete artist error:', error);
        res.status(500).json({ error: 'Error al eliminar artista' });
    }
});

module.exports = router;
