const db = require('./db');

/**
 * Core Reconciliation Engine
 * Performs matching based on amount, reference number, and unique reference number.
 */
async function runReconciliation(masterConfig, sourceData, runDate, triggerType) {
    const startTime = new Date();
    const runId = `RUN-${Math.floor(Math.random() * 89999) + 10000}`;
    
    console.log(`[ENGINE] Starting reconciliation for ${masterConfig.name} (${runId})`);

    let matchedCount = 0;
    let exceptionCount = 0;
    const exceptions = [];

    try {
        // Core Matching Logic
        // Expecting sourceData: { source1: [], source2: [], ... }
        const sources = Object.keys(sourceData);
        if (sources.length < 2) throw new Error('At least two sources are required for matching.');

        const sourceA = sourceData[sources[0]];
        const sourceB = sourceData[sources[1]];

        // Create a map for Source B for faster lookup
        // Key: amount|ref_no|unique_ref
        const bMap = new Map();
        sourceB.forEach(txn => {
            const key = `${txn.amount}|${txn.reference_number}|${txn.unique_reference_number}`;
            if (!bMap.has(key)) bMap.set(key, []);
            bMap.get(key).push(txn);
        });

        // Perform Matching
        sourceA.forEach(txnA => {
            const key = `${txnA.amount}|${txnA.reference_number}|${txnA.unique_reference_number}`;
            const matches = bMap.get(key);

            if (matches && matches.length > 0) {
                matchedCount++;
                // In a real scenario, we would 'mark' the match to prevent double counting
                matches.shift(); 
            } else {
                exceptionCount++;
                exceptions.push({
                    id: `EX-${runId}-${exceptions.length + 1}`,
                    amount: txnA.amount,
                    ref_no: txnA.reference_number,
                    type: 'Unmatched Record',
                    age: '0 days',
                    priority: 'High',
                    status: 'Open',
                    recon_master_id: masterConfig.id,
                    run_id: runId,
                    run_date: runDate,
                    source_type: 'System',
                    unique_reference_number: txnA.unique_reference_number || 'N/A',
                    assigned_role: 'Operations Maker'
                });
            }
        });

        // Remaining items in B are also exceptions
        bMap.forEach(matches => {
            matches.forEach(txnB => {
                exceptionCount++;
                exceptions.push({
                    id: `EX-${runId}-${exceptions.length + 1}`,
                    amount: txnB.amount,
                    ref_no: txnB.reference_number,
                    type: 'Missing in Source A',
                    age: '0 days',
                    priority: 'Medium',
                    status: 'Open',
                    recon_master_id: masterConfig.id,
                    run_id: runId,
                    run_date: runDate,
                    source_type: 'System',
                    unique_reference_number: txnB.unique_reference_number || 'N/A',
                    assigned_role: 'Operations Maker'
                });
            });
        });

        const endTime = new Date();
        const runTimeStr = endTime.toLocaleTimeString('en-GB', { hour12: false });
        const startTimeStr = startTime.toLocaleTimeString('en-GB', { hour12: false });

        // 1. Save Run History
        await db.promise().query(
            'INSERT INTO run_history (id, product, status, trigger_type, matched_count, exception_count, run_date, run_time, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [runId, masterConfig.name, 'Completed', triggerType, matchedCount, exceptionCount, runDate, runTimeStr, startTimeStr, runTimeStr]
        );

        // 2. Save Exceptions (if any)
        if (exceptions.length > 0) {
            const exValues = exceptions.map(e => [
                e.id, e.amount, e.ref_no, e.type, e.age, e.priority, e.status, 
                e.recon_master_id, e.run_id, e.run_date, e.source_type
            ]);
            await db.promise().query(
                'INSERT INTO exceptions (id, amount, ref_no, type, age, priority, status, recon_master_id, run_id, run_date, source_type) VALUES ?',
                [exValues]
            );
        }

        // 3. Write Audit Log
        await db.promise().query(
            'INSERT INTO audit_logs (user_name, action, module, detail, log_time, log_date, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['SYSTEM', 'Automated Recon', 'Engine', `Cycle ${runId} for ${masterConfig.name} completed. Matched: ${matchedCount}, Exceptions: ${exceptionCount}`, runTimeStr, runDate, 'System']
        );

        return {
            success: true,
            runId,
            matchedCount,
            exceptionCount,
            startTime: startTimeStr,
            endTime: runTimeStr
        };

    } catch (error) {
        console.error(`[ENGINE] Recon Failed for ${runId}:`, error.message);
        
        // Log Failure to History
        const failTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
        await db.promise().query(
            'INSERT INTO run_history (id, product, status, trigger_type, run_date, run_time) VALUES (?, ?, ?, ?, ?, ?)',
            [runId, masterConfig.name, 'Failed', triggerType, runDate, failTime]
        );

        // Log Failure to Audit
        await db.promise().query(
            'INSERT INTO audit_logs (user_name, action, module, detail, log_time, log_date, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['SYSTEM', 'Recon Failed', 'Engine', `Cycle ${runId} for ${masterConfig.name} failed: ${error.message}`, failTime, runDate, 'Security']
        );

        throw error;
    }
}

module.exports = { runReconciliation };
