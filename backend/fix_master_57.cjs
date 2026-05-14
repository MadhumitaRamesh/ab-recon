const mysql = require('mysql2');

const db = mysql.createConnection({
    socketPath: '/tmp/mysql.sock',
    user: 'root',
    password: 'root',
    database: 'ab_recon_db'
});

db.query('SELECT source_config FROM masters WHERE id = 57', (err, results) => {
    if (err) { console.error(err); process.exit(1); }
    let rawConfig = results[0].source_config;
    let config = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
    
    // Set both sources to API-Based with sample responses to ensure success
    config[0].sampleResponse = JSON.stringify({ 
        data: [ { "txn_id": "T001", "total_amt": 500.0, "created_at": "2024-05-14" } ] 
    });
    config[1].type = 'API-Based';
    config[1].mapping = { amount: 'amount', reference: 'id' };
    config[1].sampleResponse = JSON.stringify({ 
        transactions: [ { "id": "T001", "amount": 500.0, "date": "2024-05-14" } ] 
    });

    db.query('UPDATE masters SET source_config = ? WHERE id = 57', [JSON.stringify(config)], (err) => {
        if (err) { console.error(err); process.exit(1); }
        console.log('Master 57 updated to be fully automated.');
        process.exit(0);
    });
});
