const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const [existing] = await pool.query('SELECT id_usuario FROM usuario WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Este email ya está registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // `salt` is a legacy column: bcrypt embeds its own salt inside
        // `password_hash`, so it is stored empty (as the seeded rows do).
        // It is still NOT NULL, so it has to be named explicitly.
        const [result] = await pool.query(
            'INSERT INTO usuario (nombre, email, password_hash, salt, fecha_registro, tipo_cuenta, saldo, fecha_nacimiento, pais) VALUES (?, ?, ?, "", CURDATE(), "Free", 0.00, "1990-01-01", "Desconocido")',
            [nombre, email, passwordHash]
        );

        res.status(201).json({ message: 'Registro exitoso', userId: result.insertId });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Error en el registro' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const [rows] = await pool.query(
            'SELECT id_usuario, nombre, email, password_hash, tipo_cuenta FROM usuario WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Email no registrado' });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        await pool.query('UPDATE usuario SET ultima_conexion = NOW() WHERE id_usuario = ?', [user.id_usuario]);

        const token = jwt.sign(
            {
                id_usuario: user.id_usuario,
                nombre: user.nombre,
                email: user.email,
                tipo_cuenta: user.tipo_cuenta
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id_usuario: user.id_usuario,
                nombre: user.nombre,
                email: user.email,
                tipo_cuenta: user.tipo_cuenta
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error en el login' });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token requerido' });
        }

        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Token inválido' });
            }

            const [rows] = await pool.query(
                'SELECT id_usuario, nombre, email, tipo_cuenta, fecha_registro, saldo, fecha_nacimiento, pais, ultima_conexion FROM usuario WHERE id_usuario = ?',
                [decoded.id_usuario]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json(rows[0]);
        });
    } catch (error) {
        console.error('Me error:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

module.exports = router;
