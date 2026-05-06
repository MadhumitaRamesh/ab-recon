const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection Configuration
const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ab_recon_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Handle Unix Sockets (Common on macOS manual installs)
if (process.platform === 'darwin') {
    dbConfig.socketPath = '/tmp/mysql.sock';
    // Remove host when using socket
    delete dbConfig.host;
}

const db = mysql.createPool(dbConfig);

// Verify Connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('CRITICAL: MySQL Connection Failed.');
        console.error('Error Details:', err.message);
        console.log('Attempted Config:', JSON.stringify({ ...dbConfig, password: '****' }));
    } else {
        console.log('SUCCESS: Connected to Aditya Birla Reconciliation Database (MySQL).');
        connection.release();
    }
});

// --- API ENDPOINTS ---

app.get('/api/roles', (req, res) => {
    db.query('SELECT * FROM roles', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/permissions', (req, res) => {
    db.query('SELECT * FROM permissions', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/masters', (req, res) => {
    db.query('SELECT * FROM masters', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/masters', (req, res) => {
    const { name, frequency, type, sources, status } = req.body;
    db.query('INSERT INTO masters (name, frequency, type, sources, status) VALUES (?, ?, ?, ?, ?)', 
    [name, frequency, type, sources, status], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: results.insertId, ...req.body });
    });
});

app.get('/api/exceptions', (req, res) => {
    db.query('SELECT * FROM exceptions', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/audit-logs', (req, res) => {
    db.query('SELECT * FROM audit_logs ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/audit-logs', (req, res) => {
    const { user_name, action, module, detail, type, forensic_hash } = req.body;
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const date = new Date().toISOString().split('T')[0];
    
    db.query('INSERT INTO audit_logs (user_name, action, module, detail, log_time, log_date, type, forensic_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
    [user_name, action, module, detail, time, date, type, forensic_hash], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/run-history', (req, res) => {
    db.query('SELECT * FROM run_history ORDER BY run_date DESC, run_time DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/run-history', (req, res) => {
    const { id, product, status, matched_count, exception_count } = req.body;
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const date = new Date().toISOString().split('T')[0];

    db.query('INSERT INTO run_history (id, product, status, matched_count, exception_count, run_time, run_date) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [id, product, status, matched_count, exception_count, time, date], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/notifications', (req, res) => {
    db.query('SELECT * FROM notifications ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/notifications', (req, res) => {
    const { title, message, time_label } = req.body;
    db.query('INSERT INTO notifications (title, message, time_label) VALUES (?, ?, ?)', 
    [title, message, time_label], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: results.insertId, ...req.body });
    });
});

app.get('/api/ai-suggestions', (req, res) => {
    db.query('SELECT * FROM ai_suggestions', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});
