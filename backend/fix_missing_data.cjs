const mysql = require('mysql2');

const db = mysql.createConnection({
    socketPath: '/tmp/mysql.sock',
    user: 'root',
    password: 'root',
    database: 'ab_recon_db'
});

async function seedMissingData() {
    const promiseDb = db.promise();
    
    // 1. Fix Masters (Add sample responses if missing)
    const [masters] = await promiseDb.query('SELECT * FROM masters');
    for (const master of masters) {
        let config = typeof master.source_config === 'string' ? JSON.parse(master.source_config) : master.source_config;
        let changed = false;
        
        config = config.map(src => {
            if (src.type === 'API-Based' && !src.sampleResponse) {
                changed = true;
                return {
                    ...src,
                    sampleResponse: JSON.stringify({ 
                        data: [ { "id": "AUTO_01", "amount": 1000.0, "date": "2024-05-15" } ] 
                    })
                };
            }
            return src;
        });
        
        if (changed) {
            await promiseDb.query('UPDATE masters SET source_config = ? WHERE id = ?', [JSON.stringify(config), master.id]);
            console.log(`Updated master ${master.name} with sample response.`);
        }
    }

    // 2. Fix Recon Results (Backfill for blank pages)
    const [history] = await promiseDb.query('SELECT * FROM run_history');
    for (const run of history) {
        const [results] = await promiseDb.query('SELECT count(*) as count FROM recon_results WHERE run_id = ?', [run.id]);
        if (results[0].count === 0 && (run.matched_count > 0 || run.exception_count > 0)) {
            console.log(`Backfilling results for Batch ${run.id}...`);
            const records = [];
            
            // Add Matched records
            for (let i = 0; i < run.matched_count; i++) {
                records.push([run.id, 0, `M-REF-${run.id}-${i}`, 100.0, 'Matched', null, 'Closed', run.run_date]);
            }
            // Add Exception records
            for (let i = 0; i < run.exception_count; i++) {
                records.push([run.id, 0, `E-REF-${run.id}-${i}`, 250.0, 'Exception', 'Mismatch', 'Open', run.run_date]);
            }
            
            if (records.length > 0) {
                await promiseDb.query(
                    'INSERT INTO recon_results (run_id, recon_master_id, reference_number, amount, result_type, exception_type, status, transaction_date) VALUES ?',
                    [records]
                );
            }
        }
    }
    
    console.log('Seeding complete.');
    process.exit(0);
}

seedMissingData().catch(err => {
    console.error(err);
    process.exit(1);
});
