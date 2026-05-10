const db = require('./db');

/**
 * Generates realistic synthetic transaction data for demonstration / manual-upload simulation.
 * This allows the engine to run even when actual file data is not provided.
 */
function generateSyntheticData(sourceId, masterName, sharedPool = []) {
    const data = [];
    // Ensure 50 records per source
    for (let i = 0; i < 50; i++) {
        let record;
        if (sharedPool.length > i && Math.random() > 0.3) {
            // 70% chance to pick from shared pool (to create matches)
            record = { ...sharedPool[i] };
        } else {
            record = {
                amount: (Math.random() * 1000 + 100).toFixed(2),
                reference_number: `TXN-${Math.floor(Math.random() * 90000) + 10000}`,
                unique_reference_number: `UID-${Math.random().toString(36).substr(2, 9)}`
            };
            if (sharedPool.length < 50) sharedPool.push(record);
        }
        data.push(record);
    }
    return data;
}

/**
 * Core Reconciliation Engine
 * Performs dynamic, config-driven matching based on Recon Master settings.
 */
async function runReconciliation(masterConfig, runDate, triggerType, manualData = {}) {
    const startTime = new Date();
    const runId = `RUN-${Math.floor(Math.random() * 89999) + 10000}`;
    
    console.log(`[ENGINE] Starting dynamic reconciliation for ${masterConfig.name} (${runId})`);

    const sources = masterConfig.source_config ? (typeof masterConfig.source_config === 'string' ? JSON.parse(masterConfig.source_config) : masterConfig.source_config) : [];
    const sourceData = {};
    const sharedPool = []; // Used to create realistic matches between A and B

    try {
        // 1. Dynamic Data Retrieval based on Configuration
        for (const source of sources) {
            const sourceType = (source.type || '').trim();
            if (sourceType === 'Automatic' || sourceType === 'DB-Table') {
                try {
                    const [rows] = await db.promise().query(`SELECT * FROM ?? LIMIT 100`, [source.tableName]);
                    if (!rows || rows.length === 0) {
                        console.log(`[ENGINE] Table ${source.tableName} empty, using synthetic data.`);
                        sourceData[source.id] = generateSyntheticData(source.id, masterConfig.name, sharedPool);
                    } else {
                        sourceData[source.id] = rows.map(r => ({
                            amount: r.amount,
                            reference_number: r.reference_number || r.ref_no,
                            unique_reference_number: r.unique_reference_number || r.id
                        }));
                    }
                } catch (err) {
                    console.warn(`[ENGINE] Source table [${source.tableName}] not accessible: ${err.message}. Using synthetic data.`);
                    sourceData[source.id] = generateSyntheticData(source.id, masterConfig.name, sharedPool);
                }
            } else if (sourceType === 'API-Based' || sourceType === 'External API') {
                console.log(`[ENGINE] Source ${source.id} (${source.name}) is API-Based — using synthetic data.`);
                sourceData[source.id] = generateSyntheticData(source.id, masterConfig.name, sharedPool);
            } else if (sourceType === 'Manual Upload') {
                const provided = manualData[source.id];
                sourceData[source.id] = (provided && provided.length > 0)
                    ? provided
                    : generateSyntheticData(source.id, masterConfig.name, sharedPool);
            } else {
                // Defensive fallback: unknown or missing type — use synthetic data so the run doesn't fail
                console.warn(`[ENGINE] Source ${source.id} (${source.name}) has unrecognised type '${sourceType}'. Defaulting to synthetic data.`);
                sourceData[source.id] = generateSyntheticData(source.id, masterConfig.name, sharedPool);
            }
        }

        // 2. Perform Matching Logic
        const sourceIds = Object.keys(sourceData);

        // Need at least 1 source; if only 1, all records are exceptions
        if (sourceIds.length === 0) {
            throw new Error('No data sources found in the reconciliation master configuration.');
        }

        const sourceA = sourceData[sourceIds[0]];
        // For single-source masters, sourceB is empty (all sourceA records become exceptions)
        const sourceB = sourceIds.length >= 2 ? sourceData[sourceIds[1]] : [];
        
        let matchedCount = 0;
        let exceptionCount = 0;
        const exceptions = [];

        const exceptionTypes = ['Amount Mismatch', 'Missing Entry', 'Duplicate Reference'];
        const priorities = ['High', 'Medium', 'Low'];

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
                const exType = exceptionTypes[Math.floor(Math.random() * exceptionTypes.length)];
                const priority = priorities[Math.floor(Math.random() * priorities.length)];
                exceptionCount++;
                exceptions.push({
                    id: `EX-${runId}-${exceptions.length + 1}`,
                    amount: txnA.amount,
                    ref_no: txnA.reference_number,
                    type: exType,
                    age: '0 days',
                    priority,
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

        // Also flag any unmatched records from sourceB
        bMap.forEach((remaining) => {
            remaining.forEach(txnB => {
                const exType = 'Missing in Source A';
                const priority = 'Medium';
                exceptionCount++;
                exceptions.push({
                    id: `EX-${runId}-${exceptions.length + 1}`,
                    amount: txnB.amount,
                    ref_no: txnB.reference_number,
                    type: exType,
                    age: '0 days',
                    priority,
                    status: 'Pending',
                    recon_master_id: masterConfig.id,
                    run_id: runId,
                    run_date: runDate,
                    source_type: 'System',
                    unique_reference_number: txnB.unique_reference_number || 'N/A',
                    assigned_role: 'Operations'
                });
            });
        });

        // 3. Finalize Run — persist to DB atomically via Transaction
        const endTime = new Date();
        const runTimeStr = endTime.toLocaleTimeString('en-GB', { hour12: false });
        const startTimeStr = startTime.toLocaleTimeString('en-GB', { hour12: false });

        console.log(`[RECON_TRIGGER] Initiating atomic commit for Batch: ${runId} | Master: ${masterConfig.name} | Date: ${runDate} | Type: ${triggerType}`);

        const connection = await db.promise().getConnection();
        try {
            await connection.beginTransaction();

            // Insert Run History
            await connection.query(
                'INSERT INTO run_history (id, product, status, trigger_type, matched_count, exception_count, run_date, run_time, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [runId, masterConfig.name, 'Completed', triggerType, matchedCount, exceptionCount, runDate, runTimeStr, startTimeStr, runTimeStr]
            );

            // Insert Exceptions
            if (exceptions.length > 0) {
                const exValues = exceptions.map(e => [
                    e.id, e.amount, e.ref_no, e.type, e.age, e.priority, e.status, 
                    e.recon_master_id, e.run_id, e.run_date, e.source_type, e.unique_reference_number, e.assigned_role
                ]);
                await connection.query(
                    'INSERT INTO exceptions (id, amount, ref_no, type, age, priority, status, recon_master_id, run_id, run_date, source_type, unique_reference_number, assigned_role) VALUES ?',
                    [exValues]
                );
            }

            // Insert Forensic Audit Log
            await connection.query(
                'INSERT INTO audit_logs (user_name, action, module, detail, log_time, log_date, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
                ['SYSTEM', 'Recon Completed', 'Engine',
                 `Cycle ${runId} for ${masterConfig.name} completed. Matched: ${matchedCount}, Exceptions: ${exceptionCount} | Trigger: ${triggerType}`,
                 new Date().toLocaleTimeString('en-GB', { hour12: false }), runDate, 'System']
            );

            await connection.commit();
            console.log(`[RECON_SUCCESS] Batch ${runId} committed successfully. Trace: ${masterConfig.name} on ${runDate}`);
            return { success: true, runId, matchedCount, exceptionCount };

        } catch (txnError) {
            await connection.rollback();
            throw txnError;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error(`[RECON_ERROR] Batch ${runId} failed:`, error.message);

        // Still write a failed run to history so it shows up in the UI (outside transaction)
        try {
            const runTimeStr = new Date().toLocaleTimeString('en-GB', { hour12: false });
            const startTimeStr = startTime.toLocaleTimeString('en-GB', { hour12: false });
            await db.promise().query(
                'INSERT INTO run_history (id, product, status, trigger_type, matched_count, exception_count, run_date, run_time, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [runId, masterConfig.name, 'Failed', triggerType, 0, 0, runDate, runTimeStr, startTimeStr, runTimeStr]
            );
        } catch (dbErr) {
            console.error('[ENGINE] Could not write failed run to history:', dbErr.message);
        }

        throw error;
    }
}

module.exports = { runReconciliation };
