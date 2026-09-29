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
            return res.status(400).json({ error: 'Todos los campos son requeridos', code: 'auth_fields_required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres', code: 'auth_password_too_short' });
        }

        const [existing] = await pool.query('SELECT id_usuario FROM usuario WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Este email ya está registrado', code: 'auth_email_taken' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // `salt` is a legacy column: bcrypt embeds its own salt inside
        // `password_hash`, so it is stored empty (as the seeded rows do).
        // It is still NOT NULL, so it has to be named explicitly.
        //
        // `tipo_cuenta` only has two values — `User` and `Admin` — and every
        // self-service signup starts as `User`. There is no upgrade path via
        // the API; promoting someone is a direct database edit.
        //
        // `fecha_nacimiento` and `pais` are nullable and left unset: inventing
        // a placeholder birthday would show up on the new user's profile as
        // though they had told us it.
        const [result] = await pool.query(
            'INSERT INTO usuario (nombre, email, password_hash, salt, fecha_registro, tipo_cuenta) VALUES (?, ?, ?, "", CURDATE(), "User")',
            [nombre, email, passwordHash]
        );

        res.status(201).json({ message: 'Registro exitoso', userId: result.insertId });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Error en el registro', code: 'auth_register_failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos', code: 'auth_credentials_required' });
        }

        const [rows] = await pool.query(
            'SELECT id_usuario, nombre, email, password_hash, tipo_cuenta FROM usuario WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Email no registrado', code: 'auth_email_unknown' });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(400).json({ error: 'Contraseña incorrecta', code: 'auth_bad_password' });
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
        res.status(500).json({ error: 'Error en el login', code: 'auth_login_failed' });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token requerido', code: 'auth_token_required' });
        }

        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Token inválido', code: 'auth_token_invalid' });
            }

            const [rows] = await pool.query(
                'SELECT id_usuario, nombre, email, tipo_cuenta, fecha_registro, fecha_nacimiento, pais, ultima_conexion FROM usuario WHERE id_usuario = ?',
                [decoded.id_usuario]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado', code: 'user_not_found' });
            }

            res.json(rows[0]);
        });
    } catch (error) {
        console.error('Me error:', error);
        res.status(500).json({ error: 'Error al obtener usuario', code: 'user_fetch_failed' });
    }
});

module.exports = router;
