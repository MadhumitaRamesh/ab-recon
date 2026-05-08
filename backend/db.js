const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    socketPath: '/tmp/mysql.sock', // Explicitly use the socket as 127.0.0.1 was refused
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ab_recon_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true // Return dates as strings to avoid timezone shifts
});

module.exports = db;
