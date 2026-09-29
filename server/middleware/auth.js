const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'spotify-clone-secret-key-2025';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token requerido', code: 'auth_token_required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado', code: 'auth_token_invalid' });
        }
        req.user = user;
        next();
    });
}

function requireAdmin(req, res, next) {
    if (req.user.tipo_cuenta !== 'Admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.', code: 'auth_admin_required' });
    }
    next();
}

module.exports = { authenticateToken, requireAdmin, JWT_SECRET };
