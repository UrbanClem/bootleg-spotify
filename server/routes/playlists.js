const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user playlists
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, COUNT(pc.id_cancion) as total_canciones
            FROM playlist p
            LEFT JOIN playlist_cancion pc ON p.id_playlist = pc.id_playlist
            WHERE p.id_usuario = ?
            GROUP BY p.id_playlist
            ORDER BY p.fecha_creacion DESC
        `, [req.user.id_usuario]);
        res.json(rows);
    } catch (error) {
        console.error('Get playlists error:', error);
        res.status(500).json({ error: 'Error al obtener playlists' });
    }
});

// Get playlist by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM playlist WHERE id_playlist = ? AND id_usuario = ?',
            [req.params.id, req.user.id_usuario]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Playlist no encontrada' });
        }

        const [songs] = await pool.query(`
            SELECT c.*, a.nombre_artista, al.titulo as titulo_album, al.portada as portada_album,
                   pc.orden, pc.fecha_agregado
            FROM playlist_cancion pc
            INNER JOIN cancion c ON pc.id_cancion = c.id_cancion
            INNER JOIN artista a ON c.id_artista = a.id_artista
            LEFT JOIN album al ON c.id_album = al.id_album
            WHERE pc.id_playlist = ?
            ORDER BY pc.orden
        `, [req.params.id]);

        res.json({ ...rows[0], canciones: songs });
    } catch (error) {
        console.error('Get playlist error:', error);
        res.status(500).json({ error: 'Error al obtener playlist' });
    }
});

// Create playlist
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { nombre_playlist, descripcion, privada } = req.body;

        const [result] = await pool.query(
            'INSERT INTO playlist (nombre_playlist, id_usuario, descripcion, privada) VALUES (?, ?, ?, ?)',
            [nombre_playlist, req.user.id_usuario, descripcion || '', privada ? 1 : 0]
        );

        res.status(201).json({ message: 'Playlist creada exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Create playlist error:', error);
        res.status(500).json({ error: 'Error al crear playlist' });
    }
});

// Update playlist
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { nombre_playlist, descripcion, privada } = req.body;

        await pool.query(
            'UPDATE playlist SET nombre_playlist = ?, descripcion = ?, privada = ? WHERE id_playlist = ? AND id_usuario = ?',
            [nombre_playlist, descripcion || '', privada ? 1 : 0, req.params.id, req.user.id_usuario]
        );

        res.json({ message: 'Playlist actualizada exitosamente' });
    } catch (error) {
        console.error('Update playlist error:', error);
        res.status(500).json({ error: 'Error al actualizar playlist' });
    }
});

// Delete playlist
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM playlist WHERE id_playlist = ? AND id_usuario = ?', [req.params.id, req.user.id_usuario]);
        res.json({ message: 'Playlist eliminada exitosamente' });
    } catch (error) {
        console.error('Delete playlist error:', error);
        res.status(500).json({ error: 'Error al eliminar playlist' });
    }
});

// Add song to playlist
router.post('/:id/songs', authenticateToken, async (req, res) => {
    try {
        const { id_cancion } = req.body;
        const playlistId = req.params.id;

        // Check if song already exists
        const [existing] = await pool.query(
            'SELECT id_playlist FROM playlist_cancion WHERE id_playlist = ? AND id_cancion = ?',
            [playlistId, id_cancion]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'La canción ya está en la playlist' });
        }

        // Get next order
        const [orderRows] = await pool.query(
            'SELECT COALESCE(MAX(orden), 0) + 1 as next_order FROM playlist_cancion WHERE id_playlist = ?',
            [playlistId]
        );

        await pool.query(
            'INSERT INTO playlist_cancion (id_playlist, id_cancion, orden) VALUES (?, ?, ?)',
            [playlistId, id_cancion, orderRows[0].next_order]
        );

        res.status(201).json({ message: 'Canción agregada a la playlist' });
    } catch (error) {
        console.error('Add song to playlist error:', error);
        res.status(500).json({ error: 'Error al agregar canción' });
    }
});

// Remove song from playlist
router.delete('/:id/songs/:songId', authenticateToken, async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM playlist_cancion WHERE id_playlist = ? AND id_cancion = ?',
            [req.params.id, req.params.songId]
        );
        res.json({ message: 'Canción removida de la playlist' });
    } catch (error) {
        console.error('Remove song error:', error);
        res.status(500).json({ error: 'Error al remover canción' });
    }
});

module.exports = router;
