const express = require('express');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all songs
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.id_cancion, c.titulo, c.duracion, c.popularidad,
                   c.fecha_lanzamiento, c.archivo_audio, c.explicit,
                   c.id_artista, c.id_album,
                   a.nombre_artista, al.titulo as titulo_album, al.portada as portada_album
            FROM cancion c
            LEFT JOIN artista a ON c.id_artista = a.id_artista
            LEFT JOIN album al ON c.id_album = al.id_album
            ORDER BY c.popularidad DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Get songs error:', error);
        res.status(500).json({ error: 'Error al obtener canciones', code: 'songs_list_failed' });
    }
});

// Get song by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.id_cancion, c.titulo, c.duracion, c.popularidad,
                   c.fecha_lanzamiento, c.archivo_audio, c.letra, c.explicit,
                   c.id_artista, c.id_album,
                   a.nombre_artista, al.titulo as titulo_album, al.portada as portada_album
            FROM cancion c
            LEFT JOIN artista a ON c.id_artista = a.id_artista
            LEFT JOIN album al ON c.id_album = al.id_album
            WHERE c.id_cancion = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Canción no encontrada', code: 'song_not_found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Get song error:', error);
        res.status(500).json({ error: 'Error al obtener canción', code: 'song_fetch_failed' });
    }
});

// Create song (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { titulo, duracion, id_artista, id_album, fecha_lanzamiento, archivo_audio, letra, explicit } = req.body;

        const [result] = await pool.query(
            'INSERT INTO cancion (titulo, duracion, id_artista, id_album, fecha_lanzamiento, archivo_audio, letra, explicit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [titulo, duracion, id_artista, id_album || null, fecha_lanzamiento, archivo_audio, letra || '', explicit ? 1 : 0]
        );

        res.status(201).json({ message: 'Canción creada exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Create song error:', error);
        res.status(500).json({ error: 'Error al crear canción', code: 'song_create_failed' });
    }
});

// Update song (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { titulo, duracion, id_artista, id_album, fecha_lanzamiento, archivo_audio, letra, explicit } = req.body;

        await pool.query(
            'UPDATE cancion SET titulo = ?, duracion = ?, id_artista = ?, id_album = ?, fecha_lanzamiento = ?, archivo_audio = ?, letra = ?, explicit = ? WHERE id_cancion = ?',
            [titulo, duracion, id_artista, id_album || null, fecha_lanzamiento, archivo_audio, letra || '', explicit ? 1 : 0, req.params.id]
        );

        res.json({ message: 'Canción actualizada exitosamente' });
    } catch (error) {
        console.error('Update song error:', error);
        res.status(500).json({ error: 'Error al actualizar canción', code: 'song_update_failed' });
    }
});

// Delete song (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Get the audio file to delete it
        const [rows] = await pool.query('SELECT archivo_audio FROM cancion WHERE id_cancion = ?', [req.params.id]);
        if (rows.length > 0 && rows[0].archivo_audio) {
            const filePath = path.join(__dirname, '..', 'uploads', 'audio', rows[0].archivo_audio);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await pool.query('DELETE FROM cancion WHERE id_cancion = ?', [req.params.id]);
        res.json({ message: 'Canción eliminada exitosamente' });
    } catch (error) {
        console.error('Delete song error:', error);
        res.status(500).json({ error: 'Error al eliminar canción', code: 'song_delete_failed' });
    }
});

module.exports = router;
