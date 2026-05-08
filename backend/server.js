const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = require('./db');
const { initScheduler } = require('./scheduler');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'abc-recon-secret-key-2026';

// --- MIDDLEWARE: RBAC ---
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            
            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ error: 'You do not have permission to trigger reconciliation runs.' });
            }
            next();
        } catch (err) {
            res.status(401).json({ error: 'Invalid or expired token.' });
        }
    };
};

db.getConnection((err, connection) => {
    if (err) {
        console.error('CRITICAL: MySQL Connection Failed:', err.message);
    } else {
        console.log('SUCCESS: Connected to Aditya Birla Reconciliation Database (MySQL).');
        connection.release();
        initScheduler(); // Start automated jobs
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

        const userData = {
            id: user.id,
            name: user.name,
            employeeId: user.employee_id,
            role: user.role_name
        };

        const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '8h' });

        res.json({ success: true, token, user: userData });
    });
});

// --- ROLES ---
app.get('/api/roles', (req, res) => {
    db.query('SELECT * FROM roles', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/roles', (req, res) => {
    const { name, description, level } = req.body;
    if (!name) return res.status(400).json({ error: 'Role name is required.' });

    db.query(
        'INSERT INTO roles (name, description, level) VALUES (?, ?, ?)',
        [name, description || '', level || 'Operational'],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: results.insertId, name, description, level });
        }
    );
});

app.put('/api/roles/:id', (req, res) => {
    const { name, description, level } = req.body;
    db.query(
        'UPDATE roles SET name = ?, description = ?, level = ? WHERE id = ?',
        [name, description, level, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.delete('/api/roles/:id', (req, res) => {
    db.query('DELETE FROM roles WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// --- PERMISSIONS ---
app.get('/api/permissions', (req, res) => {
    db.query('SELECT * FROM permissions', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/permissions', (req, res) => {
    const { module_name, role_name, is_allowed } = req.body;
    db.query(
        'INSERT INTO permissions (module_name, role_name, is_allowed) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE is_allowed = ?',
        [module_name, role_name, is_allowed, is_allowed],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// --- MASTERS ---
app.get('/api/masters', (req, res) => {
    db.query('SELECT * FROM masters', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        // Parse JSON for frontend
        const parsed = results.map(r => ({
            ...r,
            source_config: typeof r.source_config === 'string' ? JSON.parse(r.source_config) : r.source_config
        }));
        res.json(parsed);
    });
});

app.post('/api/masters', (req, res) => {
    const { name, frequency, matching_logic, run_mode, source_config, status } = req.body;
    db.query('INSERT INTO masters (name, frequency, matching_logic, run_mode, source_config, status) VALUES (?, ?, ?, ?, ?, ?)',
    [name, frequency, matching_logic, run_mode, JSON.stringify(source_config), status], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: results.insertId, ...req.body });
    });
});

app.put('/api/masters/:id', (req, res) => {
    const { name, frequency, matching_logic, run_mode, source_config, status } = req.body;
    db.query(
        'UPDATE masters SET name = ?, frequency = ?, matching_logic = ?, run_mode = ?, source_config = ?, status = ? WHERE id = ?',
        [name, frequency, matching_logic, run_mode, JSON.stringify(source_config), status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.delete('/api/masters/:id', (req, res) => {
    db.query('DELETE FROM masters WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// --- EXCEPTIONS ---
app.get('/api/exceptions', (req, res) => {
    const sql = `
        SELECT 
            e.*, 
            m.name as product_name 
        FROM exceptions e 
        LEFT JOIN masters m ON e.recon_master_id = m.id 
        ORDER BY e.run_date DESC, e.id DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/suggestions/:exceptionId', (req, res) => {
    // Simulation of Intelligence Engine matching
    // In a production app, this would query a vector DB or matching algorithm
    const { exceptionId } = req.params;
    const suggestions = [
        { 
            id: `SUG-${Math.floor(Math.random() * 900) + 100}`, 
            candidateId: `BK-${exceptionId.split('-').pop()}`, 
            confidence: 94, 
            reason: "Exact amount and reference match found in secondary source ledger." 
        },
        { 
            id: `SUG-${Math.floor(Math.random() * 900) + 100}`, 
            candidateId: `SYS-882`, 
            confidence: 82, 
            reason: "High confidence pattern match based on historical reconciliation behavior." 
        }
    ];
    res.json(suggestions);
});

app.post('/api/exceptions/bulk', (req, res) => {
    const { exceptions } = req.body;
    if (!exceptions || !Array.isArray(exceptions)) return res.status(400).json({ error: 'Invalid payload' });

    const values = exceptions.map(e => [
        e.id, e.amount, e.ref_no, e.type, e.age, e.priority, e.status, 
        e.recon_master_id, e.run_id, e.run_date, e.source_type, e.unique_reference_number, e.assigned_role
    ]);

    db.query(
        'INSERT INTO exceptions (id, amount, ref_no, type, age, priority, status, recon_master_id, run_id, run_date, source_type, unique_reference_number, assigned_role) VALUES ?',
        [values],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, count: values.length });
        }
    );
});

app.post('/api/exceptions', (req, res) => {
    const { amount, ref_no, type, age, priority, status } = req.body;
    db.query(
        'INSERT INTO exceptions (amount, ref_no, type, age, priority, status) VALUES (?, ?, ?, ?, ?, ?)',
        [amount, ref_no, type, age, priority, status],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: results.insertId, ...req.body });
        }
    );
});

app.delete('/api/exceptions/:id', (req, res) => {
    db.query('DELETE FROM exceptions WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
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

app.post('/api/run-history', checkRole(['Admin', 'Ops_Maker']), (req, res) => {
    const { id, product, status, trigger_type, matched_count, exception_count, run_date, run_time, start_time, end_time } = req.body;
    db.query(
        'INSERT INTO run_history (id, product, status, trigger_type, matched_count, exception_count, run_date, run_time, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, product, status, trigger_type, matched_count, exception_count, run_date, run_time, start_time, end_time],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// --- USERS ---
app.get('/api/users', (req, res) => {
    db.query('SELECT id, name, employee_id, role_name, status FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/users', async (req, res) => {
    const { name, employeeId, role, status, password } = req.body;
    if (!name || !employeeId || !role || !password) return res.status(400).json({ error: 'Missing required fields.' });

    try {
        const hash = await bcrypt.hash(password, 10);
        db.query(
            'INSERT INTO users (name, employee_id, role_name, status, password_hash) VALUES (?, ?, ?, ?, ?)',
            [name, employeeId, role, status || 'Active', hash],
            (err, results) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ error: `Employee ID ${employeeId} already exists in the system.` });
                    }
                    return res.status(500).json({ error: err.message });
                }
                res.json({ success: true, id: results.insertId });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Encryption failed.' });
    }
});

app.put('/api/users/:id', (req, res) => {
    const { name, employee_id, role_name, status } = req.body;
    db.query(
        'UPDATE users SET name = ?, employee_id = ?, role_name = ?, status = ? WHERE id = ?',
        [name, employee_id, role_name, status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.delete('/api/users/:id', (req, res) => {
    db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
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

app.patch('/api/notifications/read', (req, res) => {
    db.query('UPDATE notifications SET is_read = 1', (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
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
