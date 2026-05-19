const mysql = require('mysql2/promise');
const { Client } = require('pg');

const localMysqlConfig = {
    socketPath: '/tmp/mysql.sock',
    user: 'root',
    password: 'root',
    database: 'ab_recon_db'
};

const pgUrl = 'postgresql://admin:SLA5w5qDWBPWYeTjaLQPLWOiEfvFgncC@dpg-d85etkuk1jcs73fjqmv0-a.singapore-postgres.render.com/ab_recon_db';

async function runMigration() {
    console.log('>>> STARTING LOCAL MYSQL TO RENDER POSTGRES DATA MIGRATION <<<');
    
    // 1. Connect to both databases
    const mysqlConn = await mysql.createConnection(localMysqlConfig);
    const pgClient = new Client({
        connectionString: pgUrl,
        ssl: { rejectUnauthorized: false }
    });
    await pgClient.connect();
    
    console.log('Connected to both databases successfully!');
    
    const tables = [
        { name: 'roles', autoInc: true },
        { name: 'permissions', autoInc: true },
        { name: 'masters', autoInc: true },
        { name: 'run_history', autoInc: false },
        { name: 'exceptions', autoInc: false },
        { name: 'audit_logs', autoInc: true },
        { name: 'notifications', autoInc: true },
        { name: 'ai_suggestions', autoInc: false },
        { name: 'suggestions', autoInc: true },
        { name: 'recon_results', autoInc: true },
        { name: 'recon_query_config', autoInc: true },
        { name: 'users', autoInc: true }
    ];
    
    // Disable constraints temporarily or delete in order of foreign key dependency
    // Deleting in reverse dependency order:
    const deleteOrder = [
        'recon_query_config', 'recon_results', 'suggestions', 'ai_suggestions',
        'notifications', 'audit_logs', 'exceptions', 'run_history',
        'users', 'masters', 'permissions', 'roles'
    ];
    
    console.log('Clearing existing remote PostgreSQL records...');
    for (const t of deleteOrder) {
        await pgClient.query(`DELETE FROM ${t}`);
    }
    console.log('All remote PostgreSQL tables cleared successfully!');
    
    // 2. Migrate each table
    for (const t of tables) {
        console.log(`Migrating table: ${t.name}...`);
        
        // Fetch remote columns
        const pgColsRes = await pgClient.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
            [t.name]
        );
        const pgCols = pgColsRes.rows.map(r => r.column_name);
        
        // Fetch from MySQL
        const [rows] = await mysqlConn.query(`SELECT * FROM ${t.name}`);
        if (rows.length === 0) {
            console.log(`Table ${t.name} is empty in local MySQL, skipping.`);
            continue;
        }
        
        // Filter columns to only include those existing in both MySQL and PostgreSQL
        const mysqlCols = Object.keys(rows[0]);
        const cols = mysqlCols.filter(c => pgCols.includes(c));
        
        if (cols.length === 0) {
            console.log(`No matching columns found for table ${t.name}, skipping.`);
            continue;
        }
        
        const placeholders = cols.map((_, idx) => `$${idx + 1}`).join(', ');
        const insertSql = `INSERT INTO ${t.name} (${cols.join(', ')}) VALUES (${placeholders})`;
        
        // Insert into PostgreSQL
        for (const row of rows) {
            const values = cols.map(col => {
                const val = row[col];
                if (val !== null && typeof val === 'object') {
                    return JSON.stringify(val);
                }
                return val;
            });
            await pgClient.query(insertSql, values);
        }
        
        console.log(`Successfully migrated ${rows.length} rows for table ${t.name}!`);
        
        // If the table has an auto-incrementing ID in Postgres, reset the sequence value
        if (t.autoInc) {
            const seqRes = await pgClient.query(
                `SELECT pg_get_serial_sequence('${t.name}', 'id') as seq`
            );
            const seqName = seqRes.rows[0].seq;
            if (seqName) {
                await pgClient.query(
                    `SELECT setval('${seqName}', COALESCE(MAX(id), 1)) FROM ${t.name}`
                );
                console.log(`Reset sequence for ${t.name}`);
            }
        }
    }
    
    // Close connections
    await mysqlConn.end();
    await pgClient.end();
    
    console.log('>>> DATA MIGRATION COMPLETED SUCCESSFULLY! <<<');
}

runMigration().catch(err => {
    console.error('Migration failed with error:', err);
    process.exit(1);
});
