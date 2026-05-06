const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection using Unix Socket (macOS)
const db = mysql.createPool({
    socketPath: '/tmp/mysql.sock',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ab_recon_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('CRITICAL: MySQL Connection Failed:', err.message);
    } else {
        console.log('SUCCESS: Connected to Aditya Birla Reconciliation Database (MySQL).');
        connection.release();
    }
});

// --- LOGIN ENDPOINT (Bcrypt Verification) ---
app.post('/api/login', (req, res) => {
    const { employeeId, password } = req.body;
    if (!employeeId || !password) return res.status(400).json({ error: 'Missing credentials.' });

    db.query('SELECT * FROM users WHERE employee_id = ?', [employeeId], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'User not found.' });

        const user = results[0];

        // If no hash stored yet, allow login (legacy fallback)
        if (!user.password_hash) {
            return res.json({ success: true, user: {
                id: user.id, name: user.name,
                employeeId: user.employee_id,
                role: user.role_name, status: user.status
            }});
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Incorrect password.' });

        res.json({ success: true, user: {
            id: user.id, name: user.name,
            employeeId: user.employee_id,
            role: user.role_name, status: user.status
        }});
    });
});

// --- ROLES ---
app.get('/api/roles', (req, res) => {
    db.query('SELECT * FROM roles', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- PERMISSIONS ---
app.get('/api/permissions', (req, res) => {
    db.query('SELECT * FROM permissions', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- MASTERS ---
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

// --- EXCEPTIONS ---
app.get('/api/exceptions', (req, res) => {
    db.query('SELECT * FROM exceptions', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- AUDIT LOGS ---
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

// --- RUN HISTORY ---
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

// --- USERS (never expose password_hash) ---
app.get('/api/users', (req, res) => {
    db.query('SELECT id, name, employee_id, role_name, status FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- NOTIFICATIONS ---
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

// --- AI SUGGESTIONS ---
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
