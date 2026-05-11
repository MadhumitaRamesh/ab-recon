const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ 
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors()); 
app.use(express.json());

// Global logger to see EVERYTHING
app.use((req, res, next) => {
    console.log(`[GLOBAL_LOG] ${req.method} ${req.url} | Origin: ${req.headers.origin}`);
    next();
});

const db = require('./db');
const { initScheduler } = require('./scheduler');
const jwt = require('jsonwebtoken');
const { runReconciliation } = require('./ReconEngine');

const JWT_SECRET = process.env.JWT_SECRET || 'abc-recon-secret-key-2026';

// --- MIDDLEWARE: RBAC ---
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            console.warn(`[AUTH] No token provided for ${req.method} ${req.url}`);
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            
            console.log(`[AUTH] User: ${decoded.username} | Role: ${decoded.role} | Request: ${req.method} ${req.url}`);

            if (!allowedRoles.includes(decoded.role)) {
                console.warn(`[AUTH] Forbidden: Role '${decoded.role}' not in [${allowedRoles}]`);
                return res.status(403).json({ error: 'You do not have permission for this operation.' });
            }
            next();
        } catch (err) {
            console.error(`[AUTH] Token validation failed: ${err.message}`);
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

app.post('/api/permissions/bulk', (req, res) => {
    const { permissions } = req.body; // Expects array of {module_name, role_name, is_allowed}
    if (!permissions || !Array.isArray(permissions)) return res.status(400).json({ error: 'Invalid payload' });

    const values = permissions.map(p => [p.module_name, p.role_name, p.is_allowed]);
    
    db.query(
        'INSERT INTO permissions (module_name, role_name, is_allowed) VALUES ? ON DUPLICATE KEY UPDATE is_allowed = VALUES(is_allowed)',
        [values],
        (err) => {
            if (err) {
                console.error('[API] Bulk Permission Error:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, count: values.length });
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

    try {
        // Fix 2: Validation
        if (!name) return res.status(400).json({ error: 'Required field missing: name' });
        if (!frequency) return res.status(400).json({ error: 'Required field missing: frequency' });
        if (!matching_logic) return res.status(400).json({ error: 'Required field missing: matching_logic (type)' });
        if (!run_mode) return res.status(400).json({ error: 'Required field missing: run_mode (ways)' });
        if (!source_config || (Array.isArray(source_config) && source_config.length === 0)) {
            return res.status(400).json({ error: 'Required field missing: at least one source configuration' });
        }

        // Fix 1: Duplicate check
        db.query('SELECT id FROM masters WHERE name = ?', [name], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length > 0) {
                return res.status(409).json({ error: 'A reconciliation master with this name already exists.' });
            }

            db.query('INSERT INTO masters (name, frequency, matching_logic, run_mode, source_config, status) VALUES (?, ?, ?, ?, ?, ?)',
            [name, frequency, matching_logic, run_mode, JSON.stringify(source_config), status || 'Active'], (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: results.insertId, ...req.body });
            });
        });
    } catch (err) {
        res.status(500).json({ error: `Unexpected error: ${err.message}` });
    }
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
    const { date, master, type, priority, status, runId, masterId } = req.query;
    let sql = `
        SELECT e.*, m.name as product_name 
        FROM exceptions e
        LEFT JOIN masters m ON e.recon_master_id = m.id
        WHERE 1=1
    `;
    const params = [];

    if (runId) { sql += ' AND e.run_id = ?'; params.push(runId); }
    if (masterId) { sql += ' AND e.recon_master_id = ?'; params.push(masterId); }
    if (date) { sql += ' AND e.run_date = ?'; params.push(date); }
    if (master && master !== 'All Products') { sql += ' AND m.name = ?'; params.push(master); }
    if (type && type !== 'All Types') { sql += ' AND e.type = ?'; params.push(type); }
    if (priority && priority !== 'All Priorities') { sql += ' AND e.priority = ?'; params.push(priority); }
    if (status && status !== 'All Statuses') { sql += ' AND e.status = ?'; params.push(status); }

    sql += ' ORDER BY e.run_date DESC, e.id DESC';

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/suggestions/:exceptionId', (req, res) => {
    const { exceptionId } = req.params;

    // Fix 3: Check if exception exists
    db.query('SELECT id FROM exceptions WHERE id = ?', [exceptionId], (err, exResults) => {
        if (err) return res.status(500).json({ error: err.message });
        if (exResults.length === 0) {
            return res.status(404).json({ error: 'Forensic record not found for this exception ID.' });
        }

        // Fetch from suggestions table
        db.query('SELECT candidate_id as candidateId, confidence, reason FROM suggestions WHERE exception_id = ?', [exceptionId], (err, sugResults) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(sugResults || []);
        });
    });
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

app.put('/api/exceptions/:id', (req, res) => {
    const { status, remarks } = req.body;
    const { id } = req.params;
    console.log(`[API] Updating Exception | ID: ${id} | Status: ${status} | Remarks: ${remarks}`);
    
    db.query(
        'UPDATE exceptions SET status = ?, remarks = ? WHERE id = ?',
        [status, remarks, id],
        (err, results) => {
            if (err) {
                console.error(`[API] DB Error updating exception ${id}:`, err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log(`[API] Exception ${id} updated successfully. Rows affected: ${results.affectedRows}`);
            res.json({ success: true });
        }
    );
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
        res.json({ success: true });
    });
});

// --- RUN HISTORY ---
app.get('/api/run-history', async (req, res) => {
    const { date, master, status, triggerType } = req.query;
    console.log(`[API] Fetching History | Date: ${date} | Master: ${master} | Status: ${status}`);
    try {
        let sql = 'SELECT * FROM run_history WHERE 1=1';
        const params = [];
        if (date) { sql += ' AND run_date = ?'; params.push(date); }
        if (master && master !== 'All Products') { sql += ' AND product = ?'; params.push(master); }
        if (status && status !== 'All Statuses') { sql += ' AND status = ?'; params.push(status); }
        if (triggerType && triggerType !== 'All Types') { sql += ' AND trigger_type = ?'; params.push(triggerType); }
        
        sql += ' ORDER BY run_date DESC, run_time DESC LIMIT 100';
        const [rows] = await db.promise().query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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

app.post('/api/recon/trigger', async (req, res) => {
    // RBAC temporarily disabled for debugging preflight issues
    const { masterId, runDate, triggerType, manualData } = req.body;
    console.log(`[API] Recon Triggered | Master: ${masterId} | Date: ${runDate} | Type: ${triggerType}`);
    
    // Backend File Validation
    if (manualData) {
        for (const [sourceId, fileInfo] of Object.entries(manualData)) {
            if (fileInfo && typeof fileInfo === 'object' && fileInfo.name) {
                const extension = fileInfo.name.split('.').pop().toLowerCase();
                if (!['csv', 'xlsx'].includes(extension)) {
                    console.warn(`[API] Rejected invalid file type: ${fileInfo.name}`);
                    return res.status(400).json({ error: 'Only CSV and XLSX files are accepted' });
                }
                if (fileInfo.size > 10 * 1024 * 1024) {
                    console.warn(`[API] Rejected oversized file: ${fileInfo.name} (${fileInfo.size} bytes)`);
                    return res.status(400).json({ error: 'File size must be under 10MB' });
                }
            }
        }
    }

    try {
        const [masters] = await db.promise().query('SELECT * FROM masters WHERE id = ?', [masterId]);
        if (masters.length === 0) return res.status(404).json({ error: 'Master not found' });

        const result = await runReconciliation(masters[0], runDate, triggerType, manualData);
        console.log(`[API] Recon Success | Run ID: ${result.runId}`);
        res.json(result);
    } catch (err) {
        console.error(`[API] Recon Trigger Error:`, err.message);
        res.status(500).json({ error: err.message });
    }
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

// --- RECON QUERY CONFIG ---
app.get('/api/query-configs', (req, res) => {
    db.query('SELECT * FROM recon_query_config', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/query-configs', (req, res) => {
    const { recon_master_id, source_label, custom_query_template, time_offset_minutes, created_by } = req.body;
    console.log(`[API] Saving Query Config | Master: ${recon_master_id} | Source: ${source_label} | Offset: ${time_offset_minutes}`);
    
    db.query(
        'INSERT INTO recon_query_config (recon_master_id, source_label, custom_query_template, time_offset_minutes, created_by) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE custom_query_template = ?, time_offset_minutes = ?, updated_at = CURRENT_TIMESTAMP',
        [recon_master_id, source_label, custom_query_template, time_offset_minutes, created_by, custom_query_template, time_offset_minutes],
        (err, results) => {
            if (err) {
                console.error('[API] Error saving query config:', err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log(`[API] Query Config saved successfully. ID: ${results.insertId || 'Updated existing'}`);
            res.json({ success: true, id: results.insertId });
        }
    );
});

app.delete('/api/query-configs/:id', (req, res) => {
    db.query('DELETE FROM recon_query_config WHERE id = ?', [req.params.id], (err) => {
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

// --- ADMIN: RESET & REPOPULATE FLOW ---
app.post('/api/admin/reset-data', async (req, res) => {
    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();
        console.log('[ADMIN] Initiating massive system re-seed...');

        const tablesToClear = ['exceptions', 'run_history', 'audit_logs', 'ai_suggestions', 'notifications', 'masters', 'suggestions'];
        const report = { deleted: {}, inserted: {}, preserved: {} };
        
        for (const table of tablesToClear) {
            const [countRes] = await conn.query(`SELECT COUNT(*) as count FROM ${table}`);
            report.deleted[table] = countRes[0].count;
            await conn.query(`DELETE FROM ${table}`); // Safer than truncate
        }

        const securityTables = ['users', 'roles', 'permissions'];
        for (const table of securityTables) {
            const [countRes] = await conn.query(`SELECT COUNT(*) as count FROM ${table}`);
            report.preserved[table] = countRes[0].count;
        }

        // 1. RE-SEED MASTERS
        const mastersSeed = [
            { name: 'UPI P2M Settlement', freq: 'Daily', logic: '2-way', mode: 'Automatic', conf: [
                { id: 'A', name: 'Internal Ledger', type: 'Automatic', tableName: 'upi_ledger' },
                { id: 'B', name: 'NPCI Report', type: 'Automatic', tableName: 'npci_switch' }
            ]},
            { name: 'BBPS Utility Collection', freq: 'Daily', logic: '3-way', mode: 'Manual', conf: [
                { id: 'A', name: 'Agent Wallet', type: 'Manual Upload' },
                { id: 'B', name: 'Biller API', type: 'API-Based' },
                { id: 'C', name: 'Bank Nodal', type: 'Manual Upload' }
            ]},
            { name: 'Card Network (Visa/MC)', freq: 'T+2', logic: '2-way', mode: 'Automatic', conf: [
                { id: 'A', name: 'Acquiring DB', type: 'Automatic' },
                { id: 'B', name: 'Network File', type: 'Automatic' }
            ]},
            { name: 'DigiGold Redemption', freq: 'Weekly', logic: '2-way', mode: 'API-driven', conf: [
                { id: 'A', name: 'Platform API', type: 'API-Based' },
                { id: 'B', name: 'Vault Ledger', type: 'Automatic' }
            ]}
        ];

        for (const m of mastersSeed) {
            await conn.query(
                'INSERT INTO masters (name, frequency, matching_logic, run_mode, source_config, status) VALUES (?, ?, ?, ?, ?, ?)',
                [m.name, m.freq, m.logic, m.mode, JSON.stringify(m.conf), 'Active']
            );
        }
        const [insertedMasters] = await conn.query('SELECT id, name FROM masters');

        // 2. RE-SEED RUN HISTORY (Realistic past 3 days)
        const runSeeds = [
            { id: 'RUN-501', product: 'UPI P2M Settlement', status: 'Completed', matched: '85,240', ex: '142', date: '2026-05-08' },
            { id: 'RUN-502', product: 'BBPS Utility Collection', status: 'Completed', matched: '12,400', ex: '28', date: '2026-05-08' },
            { id: 'RUN-498', product: 'Card Network', status: 'Completed', matched: '45,100', ex: '89', date: '2026-05-07' },
            { id: 'RUN-495', product: 'DigiGold Redemption', status: 'Failed', matched: '0', ex: '0', date: '2026-05-06' }
        ];

        for (const r of runSeeds) {
            await conn.query(
                'INSERT INTO run_history (id, product, status, matched_count, exception_count, run_time, run_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [r.id, r.product, r.status, r.matched, r.ex, '10:00:00', r.date]
            );
        }

        // 3. RE-SEED EXCEPTIONS
        const exSeeds = [
            { id: 'EX-9001', amt: 5400.00, ref: 'TXN_UPI_8829', type: 'Amount Mismatch', priority: 'High', status: 'Unresolved', masterId: insertedMasters[0].id },
            { id: 'EX-9002', amt: 1250.50, ref: 'BBPS_REF_112', type: 'Missing Entry', priority: 'Medium', status: 'Pending Review', masterId: insertedMasters[1].id },
            { id: 'EX-9003', amt: 89000.00, ref: 'CARD_MC_9901', type: 'Late Settlement', priority: 'High', status: 'Unresolved', masterId: insertedMasters[2].id },
            { id: 'EX-9004', amt: 450.00, ref: 'UPI_ERR_443', type: 'Duplicate', priority: 'Low', status: 'Investigating', masterId: insertedMasters[0].id }
        ];

        for (const e of exSeeds) {
            await conn.query(
                'INSERT INTO exceptions (id, amount, ref_no, type, age, priority, status, recon_master_id, run_id, run_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [e.id, e.amt, e.ref, e.type, '24h', e.priority, e.status, e.masterId, 'RUN-501', '2026-05-08']
            );
        }

        // 4. RE-SEED AI SUGGESTIONS
        const aiSeeds = [
            { id: 'AI-SURGE-01', type: 'Pattern Match', confidence: 95, detail: '12 transactions in UPI match exactly by UTR but vary by rounding (₹0.01).', action: 'Bulk Auto-Resolve' },
            { id: 'AI-ANOMALY-05', type: 'Network Latency', confidence: 82, detail: 'Bank Nodal report shows 4-hour drift compared to Switch logs.', action: 'Adjust Settlement Window' }
        ];

        for (const a of aiSeeds) {
            await conn.query(
                'INSERT INTO ai_suggestions (id, type, confidence, detail, recommended_action) VALUES (?, ?, ?, ?, ?)',
                [a.id, a.type, a.confidence, a.detail, a.action]
            );
        }

        // 5. FINAL AUDIT LOG
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        const date = new Date().toISOString().split('T')[0];
        await conn.query(
            'INSERT INTO audit_logs (user_name, action, module, detail, log_time, log_date, type, forensic_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            ['ADMIN_SYSTEM', 'MASSIVE_RESEED', 'Platform', 'System successfully purged and repopulated with realistic demo data.', time, date, 'Security', 'SEED_' + Date.now()]
        );

        await conn.commit();
        res.json({ success: true, report });

    } catch (err) {
        await conn.rollback();
        console.error('[ADMIN] Seed failed:', err.message);
        res.status(500).json({ error: 'Seed failed: ' + err.message });
    } finally {
        conn.release();
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});
