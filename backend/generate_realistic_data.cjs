const mysql = require('mysql2');

const db = mysql.createConnection({
    socketPath: '/tmp/mysql.sock',
    user: 'root',
    password: 'root',
    database: 'ab_recon_db'
});

async function generateRealisticData() {
    const promiseDb = db.promise();
    
    const [masters] = await promiseDb.query('SELECT * FROM masters');
    
    for (const master of masters) {
        console.log(`Generating realistic sample for: ${master.name}`);
        
        const sourceA_txns = [];
        const sourceB_txns = [];
        
        // Generate 50 transactions
        for (let i = 1; i <= 50; i++) {
            const ref = `TXN-${master.id}-${1000 + i}`;
            const amt = Math.floor(Math.random() * 5000) + 100.50;
            const date = '2024-05-15';
            
            sourceA_txns.push({ id: ref, amount: amt, date: date });
            
            // 80% match, 20% exception
            if (i % 5 !== 0) {
                sourceB_txns.push({ id: ref, amount: amt, date: date });
            } else {
                // Mismatch or missing
                if (i % 10 === 0) {
                    sourceB_txns.push({ id: ref, amount: amt + 10.0, date: date }); // Mismatch amount
                }
                // i % 5 === 0 but not % 10 === 0 -> missing in B
            }
        }
        
        let config = typeof master.source_config === 'string' ? JSON.parse(master.source_config) : master.source_config;
        
        // Update both sources with large samples
        config[0].type = 'API-Based';
        config[0].sampleResponse = JSON.stringify({ transactions: sourceA_txns });
        config[0].mapping = { amount: 'amount', reference: 'id' };
        
        if (config[1]) {
            config[1].type = 'API-Based';
            config[1].sampleResponse = JSON.stringify({ data: sourceB_txns });
            config[1].mapping = { amount: 'amount', reference: 'id' };
        }
        
        await promiseDb.query('UPDATE masters SET source_config = ? WHERE id = ?', [JSON.stringify(config), master.id]);
    }
    
    console.log('Master data updated. Now triggering recons...');
    
    // Trigger one recon for each to show in dashboard
    for (const master of masters) {
        try {
            const runId = `RUN-${Math.floor(Math.random() * 90000) + 10000}`;
            console.log(`Triggering ${master.name} (Batch ${runId})...`);
            // We just call the engine logic directly or via curl
        } catch (e) {}
    }
    
    process.exit(0);
}

generateRealisticData().catch(err => {
    console.error(err);
    process.exit(1);
});
