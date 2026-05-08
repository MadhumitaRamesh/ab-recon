const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function seed() {
    const connection = await mysql.createConnection({
        socketPath: '/tmp/mysql.sock',
        user: 'root',
        password: 'root',
        database: 'ab_recon_db'
    });

    console.log('--- DEMO SEEDING STARTED ---');

    // 1. Roles
    console.log('Seeding Roles...');
    await connection.execute('DELETE FROM roles');
    const roles = [
        ['Admin', 'Full system access and forensic controls.', 'System'],
        ['Ops_Maker', 'Execution of reconciliation cycles.', 'Operational'],
        ['Ops_Checker', 'Approval and verification of recon results.', 'Operational'],
        ['CS_User', 'Customer Support - Read-only exceptions.', 'Functional'],
        ['FRM_User', 'Fraud Risk Management.', 'Functional'],
        ['BU_User', 'Business Unit - Analytical access.', 'Functional'],
        ['Auditor', 'Independent audit access.', 'Audit'],
        ['Compliance', 'Compliance monitoring.', 'Audit'],
        ['IT_Support', 'Technical infrastructure logs.', 'System'],
        ['Guest', 'Restricted trial access.', 'Limited']
    ];
    for (const r of roles) {
        await connection.execute('INSERT INTO roles (name, description, level) VALUES (?, ?, ?)', r);
    }

    // 2. Permissions
    console.log('Seeding Permissions...');
    await connection.execute('DELETE FROM permissions');
    const modules = [
        'Dashboard', 
        'Recon Masters', 
        'Run Recon', 
        'Exception Queue', 
        'AI Suggestions', 
        'Reports', 
        'Audit Log', 
        'Users', 
        'Roles', 
        'Permissions'
    ];
    const allRoles = ['Admin', 'Ops_Maker', 'Ops_Checker', 'CS_User', 'FRM_User', 'BU_User'];
    
    for (const role of allRoles) {
        for (const mod of modules) {
            let allowed = 0;
            if (role === 'Admin') allowed = 1;
            else if (role === 'Ops_Maker' && ['Dashboard', 'Run Recon', 'Exception Queue', 'AI Suggestions'].includes(mod)) allowed = 1;
            else if (role === 'Ops_Checker' && ['Dashboard', 'Exception Queue', 'Reports'].includes(mod)) allowed = 1;
            else if (['CS_User', 'BU_User'].includes(role) && ['Dashboard', 'Exception Queue'].includes(mod)) allowed = 1;
            
            await connection.execute('INSERT INTO permissions (module_name, role_name, is_allowed) VALUES (?, ?, ?)', [mod, role, allowed]);
        }
    }

    // 3. Users
    console.log('Seeding Users...');
    await connection.execute('DELETE FROM users');
    const pass = await bcrypt.hash('password123', 10);
    const users = [
        ['Aditya Birla', 'ABC001', 'Admin', 'Active', pass],
        ['Rajesh Kumar', 'ABC002', 'Ops_Maker', 'Active', pass],
        ['Sneha Sharma', 'ABC003', 'Ops_Checker', 'Active', pass],
        ['Amit Patel', 'ABC004', 'CS_User', 'Active', pass],
        ['Priya Singh', 'ABC005', 'FRM_User', 'Active', pass],
        ['Vikas Verma', 'ABC006', 'BU_User', 'Active', pass],
        ['Anjali Gupta', 'ABC007', 'Auditor', 'Active', pass],
        ['Suresh Raina', 'ABC008', 'Compliance', 'Active', pass]
    ];
    for (const u of users) {
        await connection.execute('INSERT INTO users (name, employee_id, role_name, status, password_hash) VALUES (?, ?, ?, ?, ?)', u);
    }

    // 4. Recon Masters
    console.log('Seeding Recon Masters...');
    await connection.execute('DELETE FROM masters');
    const masters = [
        ['Cash Back Daily Automatic', 'Daily', '2-Way', 'Automatic', JSON.stringify([
            { id: 1, name: 'Wallet DB', type: 'Automatic', tableName: 'wallet_txns' },
            { id: 2, name: 'Marketing Ledger', type: 'Automatic', tableName: 'marketing_ledger' }
        ]), 'Active'],
        ['BBPS Daily Automatic', 'Daily', '3-Way', 'Automatic', JSON.stringify([
            { id: 1, name: 'NPCI Report', type: 'Automatic', tableName: 'npci_bbps_txns' },
            { id: 2, name: 'Internal Biller DB', type: 'Automatic', tableName: 'biller_logs' },
            { id: 3, name: 'Settlement File', type: 'Manual Upload' }
        ]), 'Active'],
        ['DigiGold Weekly Manual', 'Weekly', '2-Way', 'Manual', JSON.stringify([
            { id: 1, name: 'MMTC PAMP Statement', type: 'Manual Upload' },
            { id: 2, name: 'Internal Gold Ledger', type: 'Manual Upload' }
        ]), 'Active'],
        ['UPI Settlement Daily API', 'Daily', '2-Way', 'API-Based', JSON.stringify([
            { id: 1, name: 'UPI Gateway API', type: 'API-Based', apiUrl: 'https://api.upi-gateway.com/v1/settlements' },
            { id: 2, name: 'Bank Nodal Account', type: 'Automatic', tableName: 'bank_nodal_txns' }
        ]), 'Active']
    ];
    for (const m of masters) {
        await connection.execute('INSERT INTO masters (name, frequency, matching_logic, run_mode, source_config, status) VALUES (?, ?, ?, ?, ?, ?)', m);
    }

    // 5. Run History
    console.log('Seeding Run History...');
    await connection.execute('DELETE FROM run_history');
    const [mRows] = await connection.execute('SELECT id, name, run_mode FROM masters');
    for (let i = 1; i <= 10; i++) {
        const master = mRows[i % mRows.length];
        const runId = `RUN-BATCH-${1000 + i}`;
        const date = `2026-05-0${(i % 9) + 1}`;
        await connection.execute(
            'INSERT INTO run_history (id, product, status, trigger_type, matched_count, exception_count, run_date, run_time, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [runId, master.name, 'Completed', master.run_mode === 'API-Based' ? 'API' : (i % 2 === 0 ? 'Manual' : 'Cron'), '5240', '12', date, '10:00:00', '09:59:00', '10:00:00']
        );
    }

    // 6. Exceptions
    console.log('Seeding Exceptions...');
    await connection.execute('DELETE FROM exceptions');
    const [hRows] = await connection.execute('SELECT id, product, run_date FROM run_history LIMIT 8');
    const exTypes = ['Amount Mismatch', 'Duplicate Reference', 'Missing Side-B', 'Invalid Date'];
    for (let i = 0; i < hRows.length; i++) {
        const run = hRows[i];
        await connection.execute(
            'INSERT INTO exceptions (id, amount, ref_no, type, age, priority, status, recon_master_id, run_id, run_date, source_type, unique_reference_number, assigned_role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [`EX-${run.id}-${i}`, '1500.50', `TXN-${9000 + i}`, exTypes[i % 4], '0 days', i % 2 === 0 ? 'High' : 'Medium', 'Open', 1, run.id, run.run_date, 'System', `U-REF-${i}`, 'Operations Maker']
        );
    }

    // 7. Audit Logs
    console.log('Seeding Audit Logs...');
    await connection.execute('DELETE FROM audit_logs');
    const auditData = [
        ['Aditya Birla', 'User Login', 'Auth', 'Admin session initialized via ABC001.', '09:00:00', '2026-05-01', 'System'],
        ['Rajesh Kumar', 'Run Trigger', 'Engine', 'Manual run started for Cash Back.', '10:00:00', '2026-05-01', 'Operations'],
        ['SYSTEM', 'Cron Trigger', 'Scheduler', 'Automated Daily Recon started.', '00:00:01', '2026-05-02', 'System'],
        ['Sneha Sharma', 'Exception Review', 'Exceptions', 'Exception EX-RUN-BATCH-1001-0 resolved.', '14:20:00', '2026-05-02', 'Operations'],
        ['Aditya Birla', 'Master Created', 'Masters', 'New UPI Settlement API added.', '11:00:00', '2026-05-03', 'System']
    ];
    for (let i = 0; i < 15; i++) {
        const d = auditData[i % auditData.length];
        await connection.execute('INSERT INTO audit_logs (user_name, action, module, detail, log_time, log_date, type) VALUES (?, ?, ?, ?, ?, ?, ?)', d);
    }

    console.log('--- DEMO SEEDING COMPLETE ---');
    await connection.end();
}

seed().catch(console.error);
