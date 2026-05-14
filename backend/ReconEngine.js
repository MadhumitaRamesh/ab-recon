const db = require('./db');
const XLSX = require('xlsx');

/**
 * Core Reconciliation Engine
 * Performs dynamic, config-driven matching based on Recon Master settings.
 */
async function runReconciliation(masterConfig, runDate, triggerType, manualData = {}) {
    const startTime = new Date();
    const runId = `RUN-${Math.floor(Math.random() * 89999) + 10000}`;
    
    console.log(`[ENGINE] Starting reconciliation for ${masterConfig.name} (${runId})`);

    const sources = masterConfig.source_config ? (typeof masterConfig.source_config === 'string' ? JSON.parse(masterConfig.source_config) : masterConfig.source_config) : [];
    const sourceData = {};
    
    let totalRowsRead = 0;
    let fileName = manualData.fileName || 'Manual_Upload';

    try {
        // 1. Data Retrieval and Validation
        for (const source of sources) {
            const sourceType = (source.type || '').trim();
            const sourceLabel = source.name || source.id;
            const mapping = source.mapping || { amount: 'amount', reference: 'reference_number' };

            if (sourceType === 'Manual Upload') {
                const provided = manualData[source.id]; // Expecting Array of Objects
                if (!provided || provided.length === 0) {
                    throw new Error(`Data missing for source: ${sourceLabel}`);
                }

                // Header Validation
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
                // In a production environment, this would perform a real HTTP fetch using source.apiUrl and source.apiKey
                // For this implementation, we simulate receiving data (or using provided data if it exists)
                const apiResponse = manualData[source.id] || []; 
                const apiMapping = source.apiMapping || [];

                sourceData[source.id] = apiResponse.map(item => {
                    const mappedItem = {};
                    if (apiMapping.length > 0) {
                        apiMapping.forEach(m => {
                            if (m.apiField && m.dbColumn) {
                                mappedItem[m.dbColumn] = item[m.apiField];
                            }
                        });
                    } else {
                        // Fallback to raw response fields
                        Object.assign(mappedItem, item);
                    }

                    // For the purpose of the internal recon engine, we still need to align to amount/reference
                    // using the standard mapping defined in the Recon Master
                    return {
                        amount: parseFloat(mappedItem[mapping.amount] || item[mapping.amount]) || 0,
                        reference_number: String(mappedItem[mapping.reference] || item[mapping.reference] || ''),
                        transaction_date: mappedItem.transaction_date || item.transaction_date || runDate
                    };
                });
                
                totalRowsRead += apiResponse.length;
            } else {
                // Defensive fallback for other types (can be expanded later)
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

        // Process Source A
        sourceA.forEach(txnA => {
            const key = `${txnA.amount}|${txnA.reference_number}`;
            const matches = bMap.get(key);

            if (matches && matches.length > 0) {
                matchedCount++;
                results.push({
                    run_id: runId,
                    recon_master_id: masterConfig.id,
                    amount: txnA.amount,
                    reference_number: txnA.reference_number,
                    result_type: 'Matched',
                    transaction_date: txnA.transaction_date || runDate,
                    status: 'Closed'
                });
                matches.shift();
            } else {
                exceptionCount++;
                results.push({
                    run_id: runId,
                    recon_master_id: masterConfig.id,
                    amount: txnA.amount,
                    reference_number: txnA.reference_number,
                    result_type: 'Exception',
                    exception_type: 'Missing in Source B',
                    transaction_date: txnA.transaction_date || runDate,
                    status: 'Open'
                });
            }
        });

        // Flag leftovers in B
        bMap.forEach(remaining => {
            remaining.forEach(txnB => {
                exceptionCount++;
                results.push({
                    run_id: runId,
                    recon_master_id: masterConfig.id,
                    amount: txnB.amount,
                    reference_number: txnB.reference_number,
                    result_type: 'Exception',
                    exception_type: 'Missing in Source A',
                    transaction_date: txnB.transaction_date || runDate,
                    status: 'Open'
                });
            });
        });

        // 3. Finalize Run (Atomic Transaction)
        const endTime = new Date();
        const connection = await db.promise().getConnection();
        try {
            await connection.beginTransaction();

            // History Audit Log
            await connection.query(
                'INSERT INTO run_history (id, product, status, trigger_type, matched_count, exception_count, run_date, run_time, start_time, end_time, total_rows, valid_rows, file_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [runId, masterConfig.name, 'Completed', triggerType, matchedCount, exceptionCount, runDate, 
                 endTime.toLocaleTimeString('en-GB', { hour12: false }), 
                 startTime.toLocaleTimeString('en-GB', { hour12: false }), 
                 endTime.toLocaleTimeString('en-GB', { hour12: false }), 
                 totalRowsRead, results.length, fileName]
            );

            // Detailed Results
            if (results.length > 0) {
                const values = results.map(r => [
                    r.run_id, r.recon_master_id, r.reference_number, r.amount, 
                    r.result_type, r.exception_type || null, r.status, r.transaction_date
                ]);
                await connection.query(
                    'INSERT INTO recon_results (run_id, recon_master_id, reference_number, amount, result_type, exception_type, status, transaction_date) VALUES ?',
                    [values]
                );
            }

            await connection.commit();
            return { success: true, runId, matchedCount, exceptionCount };

        } catch (dbErr) {
            await connection.rollback();
            throw dbErr;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error(`[ENGINE_ERROR] Batch ${runId} failed:`, error.message);
        throw error;
    }
}

module.exports = { runReconciliation };
