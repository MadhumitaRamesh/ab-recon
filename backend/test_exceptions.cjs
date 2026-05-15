const mysql = require('mysql2');

const db = mysql.createConnection({
    socketPath: '/tmp/mysql.sock',
    user: 'root',
    password: 'root',
    database: 'ab_recon_db'
});

db.query('SELECT source_config FROM masters WHERE id = 57', (err, results) => {
    if (err) { console.error(err); process.exit(1); }
    let config = typeof results[0].source_config === 'string' ? JSON.parse(results[0].source_config) : results[0].source_config;
    
    // Set mismatched data to force exceptions
    config[0].sampleResponse = JSON.stringify({ 
        data: [ { "txn_id": "MATCH", "total_amt": 100.0 }, { "txn_id": "MISSING_IN_B", "total_amt": 200.0 } ] 
    });
    config[1].sampleResponse = JSON.stringify({ 
        transactions: [ { "id": "MATCH", "amount": 100.0 }, { "id": "MISSING_IN_A", "amount": 300.0 } ] 
    });

    db.query('UPDATE masters SET source_config = ? WHERE id = 57', [JSON.stringify(config)], (err) => {
        if (err) { console.error(err); process.exit(1); }
        console.log('Master 57 updated with mismatch data.');
        process.exit(0);
    });
});
