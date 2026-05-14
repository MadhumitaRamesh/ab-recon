const mysql = require('mysql2');

const db = mysql.createConnection({
    socketPath: '/tmp/mysql.sock',
    user: 'root',
    password: 'root',
    database: 'ab_recon_db'
});

const apiMaster = {
    name: 'Unified API Payments Recon',
    frequency: 'Daily',
    matching_logic: '2-way',
    run_mode: 'Manual',
    status: 'Active',
    source_config: [
        {
            id: 'A',
            name: 'External Gateway API',
            type: 'API-Based',
            apiUrl: 'https://api.payments.example.com/v1/transactions',
            apiKey: 'sk_test_51MzS2X00Y5f8...',
            sampleRequest: JSON.stringify({ date: "{{date}}", status: "success", limit: 5000 }, null, 2),
            sampleResponse: JSON.stringify({ 
                data: [ 
                    { "txn_id": "T001", "total_amt": 1250.50, "created_at": "2024-05-12" } 
                ] 
            }, null, 2),
            mapping: { amount: 'transaction_amount', reference: 'transaction_id' },
            apiMapping: [
                { apiField: 'txn_id', dbColumn: 'transaction_id' },
                { apiField: 'total_amt', dbColumn: 'transaction_amount' },
                { apiField: 'created_at', dbColumn: 'transaction_date' }
            ]
        },
        {
            id: 'B',
            name: 'Internal Ledger',
            type: 'Manual Upload',
            mapping: { amount: 'amount', reference: 'reference_number' }
        }
    ]
};

db.query(
    'INSERT INTO masters (name, frequency, matching_logic, run_mode, source_config, status) VALUES (?, ?, ?, ?, ?, ?)',
    [apiMaster.name, apiMaster.frequency, apiMaster.matching_logic, apiMaster.run_mode, JSON.stringify(apiMaster.source_config), apiMaster.status],
    (err, results) => {
        if (err) {
            console.error('Error seeding API master:', err.message);
            process.exit(1);
        }
        console.log('Successfully created end-to-end API-Based Recon Master with ID:', results.insertId);
        process.exit(0);
    }
);
