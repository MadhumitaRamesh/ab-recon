const db = require('./db');
const XLSX = require('xlsx');

/**
 * Core Reconciliation Engine
 * Performs dynamic, config-driven matching based on Recon Master settings.
 */
async function runReconciliation(masterConfig, runDate, triggerType, manualData = {}) {
    const startTime = new Date();
    const runId = `RUN-${Math.floor(Math.random() * 89999) + 10000}`;
    const connection = await db.promise().getConnection();
    
    console.log(`[ENGINE] Starting reconciliation for ${masterConfig.name} (${runId})`);

    const sources = masterConfig.source_config ? (typeof masterConfig.source_config === 'string' ? JSON.parse(masterConfig.source_config) : masterConfig.source_config) : [];
    const sourceData = {};
    
    let totalRowsRead = 0;
    let fileName = manualData.fileName || 'Manual_Upload';

    try {
        await connection.beginTransaction();

        // 1. Data Retrieval and Validation
        for (const source of sources) {
            const sourceType = (source.type || '').trim();
            const sourceLabel = source.name || source.id;
            const mapping = source.mapping || { amount: 'amount', reference: 'reference_number' };

            if (sourceType === 'Manual Upload') {
                const provided = manualData[source.id]; 
                if (!provided || provided.length === 0) {
                    throw new Error(`Data missing for source: ${sourceLabel}`);
                }

                const firstRow = provided[0];
                const hasAmt = mapping.amount in firstRow;
                const hasRef = mapping.reference in firstRow;

                if (!hasAmt || !hasRef) {
                    throw new Error(`Column Mapping Error in ${sourceLabel}: Expected headers [${mapping.amount}, ${mapping.reference}] not found in file.`);
                }

                sourceData[source.id] = provided.map(row => ({
                    amount: parseFloat(row[mapping.amount]) || 0,
                    reference_number: String(row[mapping.reference] || ''),
                    transaction_date: row.transaction_date || runDate
                }));
                
                totalRowsRead += provided.length;
            } else if (sourceType === 'API-Based') {
                let apiResponse = manualData[source.id];
                
                if (!apiResponse || apiResponse.length === 0) {
                    if (source.sampleResponse) {
                        try {
                            const sample = JSON.parse(source.sampleResponse);
                            apiResponse = sample.transactions || sample.data || (Array.isArray(sample) ? sample : []);
                        } catch (e) { apiResponse = []; }
                    }
                }

                if (!apiResponse || apiResponse.length === 0) {
                    throw new Error(`API Data missing and no valid sample response found for: ${sourceLabel}`);
                }

                const apiMapping = source.apiMapping || [];
                sourceData[source.id] = apiResponse.map(item => {
                    const mappedItem = {};
                    if (apiMapping.length > 0) {
                        apiMapping.forEach(m => {
                            if (m.apiField && m.dbColumn) mappedItem[m.dbColumn] = item[m.apiField];
                        });
                    } else {
                        Object.assign(mappedItem, item);
                    }

                    return {
                        amount: parseFloat(mappedItem[mapping.amount] || item[mapping.amount]) || 0,
                        reference_number: String(mappedItem[mapping.reference] || item[mapping.reference] || ''),
                        transaction_date: mappedItem.transaction_date || item.transaction_date || runDate
                    };
                });
                
                totalRowsRead += apiResponse.length;
            } else {
                sourceData[source.id] = []; 
            }
        }

        const sourceIds = Object.keys(sourceData);
        if (sourceIds.length < 1) throw new Error('Insufficient data sources.');

        const sourceA = sourceData[sourceIds[0]];
        const sourceB = sourceIds.length >= 2 ? sourceData[sourceIds[1]] : [];
        
        const results = [];
        const bMap = new Map();

        sourceB.forEach(txn => {
            const key = `${txn.amount}|${txn.reference_number}`;
            if (!bMap.has(key)) bMap.set(key, []);
            bMap.get(key).push(txn);
        });

        let matchedCount = 0;
        let exceptionCount = 0;

        sourceA.forEach(txnA => {
            const key = `${txnA.amount}|${txnA.reference_number}`;
            const matches = bMap.get(key);

            if (matches && matches.length > 0) {
                matchedCount++;
                results.push({
                    run_id: runId, recon_master_id: masterConfig.id,
                    amount: txnA.amount, reference_number: txnA.reference_number,
                    result_type: 'Matched', transaction_date: txnA.transaction_date || runDate,
                    status: 'Closed'
                });
                matches.shift();
            } else {
                exceptionCount++;
                results.push({
                    run_id: runId, recon_master_id: masterConfig.id,
                    amount: txnA.amount, reference_number: txnA.reference_number,
                    result_type: 'Exception', exception_type: 'Missing in Source B',
                    transaction_date: txnA.transaction_date || runDate,
                    status: 'Open'
                });
            }
        });

        bMap.forEach(remaining => {
            remaining.forEach(txnB => {
                exceptionCount++;
                results.push({
                    run_id: runId, recon_master_id: masterConfig.id,
                    amount: txnB.amount, reference_number: txnB.reference_number,
                    result_type: 'Exception', exception_type: 'Missing in Source A',
                    transaction_date: txnB.transaction_date || runDate,
                    status: 'Open'
                });
            });
        });

        const endTime = new Date();

        // 3. Finalize Run (Atomic Transaction)
        await connection.query(
            'INSERT INTO run_history (id, product, status, trigger_type, matched_count, exception_count, run_date, run_time, start_time, end_time, total_rows, valid_rows, file_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [runId, masterConfig.name, 'Completed', triggerType, matchedCount, exceptionCount, runDate, 
             endTime.toLocaleTimeString('en-GB', { hour12: false }), 
             startTime.toISOString(), 
             endTime.toISOString(), 
             totalRowsRead, results.length, fileName]
        );

        if (results.length > 0) {
            const values = results.map(r => [
                r.run_id, r.recon_master_id, r.reference_number, r.amount, 
                r.result_type, r.exception_type || null, r.status, r.transaction_date
            ]);
            await connection.query(
                'INSERT INTO recon_results (run_id, recon_master_id, reference_number, amount, result_type, exception_type, status, transaction_date) VALUES ?',
                [values]
            );

            const exceptionsOnly = results.filter(r => r.result_type === 'Exception');
            if (exceptionsOnly.length > 0) {
                const exValues = exceptionsOnly.map((e, idx) => [
                    `EX-${runId}-${idx + 1}`, e.amount, e.reference_number,
                    e.exception_type || 'Mismatch', '0 days', 'High', 'Pending',
                    masterConfig.id, runId, runDate, 'System', e.reference_number, 'Operations'
                ]);
                await connection.query(
                    'INSERT INTO exceptions (id, amount, ref_no, type, age, priority, status, recon_master_id, run_id, run_date, source_type, unique_reference_number, assigned_role) VALUES ?',
                    [exValues]
                );
            }
        }

        await connection.query(
            'INSERT INTO audit_logs (user_name, action, module, detail, log_time, log_date, type, forensic_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            ['System', 'Recon Completed', masterConfig.name, `Batch ${runId} finalized. Matched: ${matchedCount}, Exceptions: ${exceptionCount}`, 
             endTime.toLocaleTimeString('en-GB', { hour12: false }), runDate, 'Activity', `SUCCESS_${runId}`]
        );

        await connection.commit();
        return { success: true, runId, matchedCount, exceptionCount };

    } catch (err) {
        if (connection) {
            await connection.rollback();
            try {
                await connection.query(
                    'INSERT INTO run_history (id, product, status, trigger_type, matched_count, exception_count, run_date, run_time, start_time, end_time, total_rows, valid_rows, file_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [runId, masterConfig.name, 'Failed', triggerType, 0, 0, runDate, 
                     new Date().toLocaleTimeString('en-GB', { hour12: false }), 
                     startTime.toISOString(), 
                     new Date().toISOString(), 
                     totalRowsRead, 0, fileName]
                );
                await connection.query(
                    'INSERT INTO audit_logs (user_name, action, module, detail, log_time, log_date, type, forensic_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    ['System', 'Recon Failed', masterConfig.name, `Batch ${runId} failed: ${err.message}`, 
                     new Date().toLocaleTimeString('en-GB', { hour12: false }), 
                     runDate, 'Error', `ERR_${runId}`]
                );
            } catch (auditErr) {
                console.error(`[ENGINE_AUDIT_ERROR] Failed to log failure for ${runId}:`, auditErr.message);
            }
        }
        console.error(`[ENGINE_ERROR] Batch ${runId} failed: ${err.message}`);
        throw err;
    } finally {
        if (connection) connection.release();
    }
}

module.exports = { runReconciliation };
