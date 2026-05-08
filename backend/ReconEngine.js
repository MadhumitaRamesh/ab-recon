const db = require('./db');

/**
 * Core Reconciliation Engine
 * Performs dynamic, config-driven matching based on Recon Master settings.
 */
async function runReconciliation(masterConfig, runDate, triggerType, manualData = {}) {
    const startTime = new Date();
    const runId = `RUN-${Math.floor(Math.random() * 89999) + 10000}`;
    
    console.log(`[ENGINE] Starting dynamic reconciliation for ${masterConfig.name} (${runId})`);

    const sourceData = {};
    const sources = Array.isArray(masterConfig.source_config) ? masterConfig.source_config : JSON.parse(masterConfig.source_config || '[]');

    try {
        // 1. Dynamic Data Retrieval based on Configuration
        for (const source of sources) {
            if (source.type === 'Automatic') {
                try {
                    const [rows] = await db.promise().query(
                        `SELECT * FROM ${source.tableName} WHERE date = ? AND product = ?`,
                        [runDate, masterConfig.name]
                    );
                    sourceData[source.id] = rows.map(r => ({
                        amount: r.amount,
                        reference_number: r.reference_number,
                        unique_reference_number: r.unique_reference_number || r.reference_number
                    }));
                } catch (err) {
                    throw new Error(`Source table [${source.tableName}] is not compatible or missing required columns (date, product).`);
                }
            } else if (source.type === 'API-Based') {
                // Mock API retrieval for forensic demonstration
                console.log(`[ENGINE] Fetching from API: ${source.apiUrl}`);
                sourceData[source.id] = [
                    { amount: 1200.50, reference_number: 'TXN-API-1', unique_reference_number: 'URN-API-1' }
                ];
            } else if (source.type === 'Manual Upload') {
                sourceData[source.id] = manualData[source.id] || [];
            }
        }

        // 2. Perform Matching Logic
        const sourceIds = Object.keys(sourceData);
        if (sourceIds.length < 2) throw new Error('At least two valid data sources are required for reconciliation.');

        const sourceA = sourceData[sourceIds[0]];
        const sourceB = sourceData[sourceIds[1]];
        
        let matchedCount = 0;
        let exceptionCount = 0;
        const exceptions = [];

        const bMap = new Map();
        sourceB.forEach(txn => {
            const key = `${txn.amount}|${txn.reference_number}`;
            if (!bMap.has(key)) bMap.set(key, []);
            bMap.get(key).push(txn);
        });

        sourceA.forEach(txnA => {
            const key = `${txnA.amount}|${txnA.reference_number}`;
            const matches = bMap.get(key);
            if (matches && matches.length > 0) {
                matchedCount++;
                matches.shift();
            } else {
                exceptionCount++;
                exceptions.push({
                    id: `EX-${runId}-${exceptions.length + 1}`,
                    amount: txnA.amount,
                    ref_no: txnA.reference_number,
                    type: 'Amount Mismatch',
                    age: '0 days',
                    priority: 'High',
                    status: 'Pending',
                    recon_master_id: masterConfig.id,
                    run_id: runId,
                    run_date: runDate,
                    source_type: 'System',
                    unique_reference_number: txnA.unique_reference_number || 'N/A',
                    assigned_role: 'Operations'
                });
            }
        });

        // 3. Finalize Run
        const endTime = new Date();
        const runTimeStr = endTime.toLocaleTimeString('en-GB', { hour12: false });
        const startTimeStr = startTime.toLocaleTimeString('en-GB', { hour12: false });

        await db.promise().query(
            'INSERT INTO run_history (id, product, status, trigger_type, matched_count, exception_count, run_date, run_time, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [runId, masterConfig.name, 'Completed', triggerType, matchedCount, exceptionCount, runDate, runTimeStr, startTimeStr, runTimeStr]
        );

        if (exceptions.length > 0) {
            const exValues = exceptions.map(e => [
                e.id, e.amount, e.ref_no, e.type, e.age, e.priority, e.status, 
                e.recon_master_id, e.run_id, e.run_date, e.source_type, e.unique_reference_number, e.assigned_role
            ]);
            await db.promise().query(
                'INSERT INTO exceptions (id, amount, ref_no, type, age, priority, status, recon_master_id, run_id, run_date, source_type, unique_reference_number, assigned_role) VALUES ?',
                [exValues]
            );
        }

        // 3. Write Forensic Audit Log — links runId to audit trail
        await db.promise().query(
            'INSERT INTO audit_logs (user_name, action, module, detail, log_time, log_date, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['SYSTEM', 'Recon Completed', 'Engine',
             `Cycle ${runId} for ${masterConfig.name} completed. Matched: ${matchedCount}, Exceptions: ${exceptionCount}`,
             new Date().toLocaleTimeString('en-GB', { hour12: false }), runDate, 'System']
        );

        return { success: true, runId, matchedCount, exceptionCount };

    } catch (error) {
        console.error(`[ENGINE] Dynamic Recon Failed:`, error.message);
        throw error;
    }
}

module.exports = { runReconciliation };
