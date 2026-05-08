const db = require('../db');

async function runReset() {
    console.log('--- MANUAL SYSTEM RESET START ---');
    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();
        const tables = ['exceptions', 'run_history', 'audit_logs', 'ai_suggestions', 'notifications', 'masters', 'suggestions'];
        
        for (const table of tables) {
            console.log(`Clearing ${table}...`);
            await conn.query(`DELETE FROM ${table}`);
        }

        console.log('Seeding Masters...');
        const mastersSeed = [
            { name: 'UPI P2M Settlement', freq: 'Daily', logic: '2-way', mode: 'Automatic', conf: JSON.stringify([{ id: 'A', name: 'Internal' }, { id: 'B', name: 'NPCI' }]) },
            { name: 'BBPS Collection', freq: 'Daily', logic: '3-way', mode: 'Manual', conf: JSON.stringify([{ id: 'A', name: 'Agent' }, { id: 'B', name: 'Biller' }, { id: 'C', name: 'Nodal' }]) }
        ];
        for (const m of mastersSeed) {
            await conn.query('INSERT INTO masters (name, frequency, matching_logic, run_mode, source_config, status) VALUES (?, ?, ?, ?, ?, ?)',
            [m.name, m.freq, m.logic, m.mode, m.conf, 'Active']);
        }

        const [insertedMasters] = await conn.query('SELECT id FROM masters');

        console.log('Seeding Run History...');
        await conn.query('INSERT INTO run_history (id, product, status, matched_count, exception_count, run_time, run_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['RUN-MAN-01', 'UPI P2M Settlement', 'Completed', '1,000', '5', '10:00:00', '2026-05-08']);

        console.log('Seeding Exceptions...');
        await conn.query('INSERT INTO exceptions (id, amount, ref_no, type, age, priority, status, recon_master_id, run_id, run_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['EX-MAN-01', 500.0, 'REF-1', 'Mismatch', '24h', 'High', 'Unresolved', insertedMasters[0].id, 'RUN-MAN-01', '2026-05-08']);

        await conn.commit();
        console.log('--- MANUAL RESET SUCCESS ---');
    } catch (err) {
        await conn.rollback();
        console.error('--- MANUAL RESET FAILED ---', err.message);
    } finally {
        conn.release();
        process.exit();
    }
}

runReset();
