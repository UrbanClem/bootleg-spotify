const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id_usuario, nombre, email, tipo_cuenta, fecha_registro, pais, ultima_conexion FROM usuario ORDER BY fecha_registro DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Error al obtener usuarios', code: 'users_list_failed' });
    }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id_usuario, nombre, email, tipo_cuenta, fecha_registro, fecha_nacimiento, pais, ultima_conexion FROM usuario WHERE id_usuario = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado', code: 'user_not_found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Error al obtener usuario', code: 'user_fetch_failed' });
    }
});

// Update user profile
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { nombre, email, fecha_nacimiento, pais } = req.body;
        const userId = req.params.id;

        // Users can only update their own profile (unless admin)
        if (req.user.id_usuario !== parseInt(userId) && req.user.tipo_cuenta !== 'Admin') {
            return res.status(403).json({ error: 'No autorizado', code: 'user_forbidden' });
        }

        await pool.query(
            'UPDATE usuario SET nombre = ?, email = ?, fecha_nacimiento = ?, pais = ? WHERE id_usuario = ?',
            [nombre, email, fecha_nacimiento, pais, userId]
        );

        res.json({ message: 'Perfil actualizado exitosamente' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Error al actualizar perfil', code: 'user_update_failed' });
    }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM usuario WHERE id_usuario = ?', [req.params.id]);
        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Error al eliminar usuario', code: 'user_delete_failed' });
    }
});

module.exports = router;
