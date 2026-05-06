const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ab_recon_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verify Connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('CRITICAL: MySQL Connection Failed. Ensure MySQL is running and schema.sql is executed.');
        console.error('Error Details:', err.message);
    } else {
        console.log('SUCCESS: Connected to Aditya Birla Reconciliation Database (MySQL).');
        connection.release();
    }
});

// --- API ENDPOINTS ---

// 1. Roles & Permissions
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

// 2. Product Masters
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

// 3. Exception Queue
app.get('/api/exceptions', (req, res) => {
    db.query('SELECT * FROM exceptions', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 4. Audit Logs
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

// 5. Run History
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

// 6. Users
app.get('/api/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 7. Notifications
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

// 8. AI Suggestions
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
