const mysql = require('mysql2/promise');

// Aiven requires SSL. Render's network enforces it too, so always use it.
// `rejectUnauthorized: false` is fine for a demo — it still encrypts the
// connection, it just doesn't verify the CA chain.
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'spotify_db',
    port: Number(process.env.DB_PORT) || 3306,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
