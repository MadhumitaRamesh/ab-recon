const db = require('./db');
const XLSX = require('xlsx');

/**
 * Core Reconciliation Engine
 * Performs dynamic, config-driven matching based on Recon Master settings.
 */
async function runReconciliation(masterConfig, runDate, triggerType, manualData = {}) {
    const getISTTime = () => {
        const now = new Date();
        const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        return ist.toISOString().replace('T', ' ').substring(0, 19);
    };

    const startTime = getISTTime();
    const runId = `RUN-${Math.floor(Math.random() * 89999) + 10000}`;
    const connection = await db.promise().getConnection();
    
    console.log(`[ENGINE] Starting reconciliation for ${masterConfig.name} (${runId})`);

    const sources = masterConfig.source_config ? (typeof masterConfig.source_config === 'string' ? JSON.parse(masterConfig.source_config) : masterConfig.source_config) : [];
    const sourceData = {};
    
    let totalRowsRead = 0;
    let fileName = manualData.fileName || 'Manual_Upload';

    try {
        await connection.beginTransaction();

        // 1. Data Retrieval — keyed by source array index
        for (let i = 0; i < sources.length; i++) {
            const source = sources[i];
            const sourceType = (source.type || '').trim();
            const sourceLabel = source.name || `Source ${i}`;
            const mapping = source.mapping || { amount: 'amount', reference: 'reference_number' };

            if (sourceType === 'Manual Upload') {
                // Data is keyed by index from the frontend (RunRecon.jsx)
                const provided = manualData[i];
                if (!provided || provided.length === 0) {
                    throw new Error(`Data missing for source: ${sourceLabel}. Please upload a file for this source.`);
                }

                const firstRow = provided[0];
                console.log(`[ENGINE] ${sourceLabel} - Columns received: [${Object.keys(firstRow).join(', ')}]`);

                // Known aliases for each column type
                const REF_ALIASES = ['Reference No', 'Reference No.', 'Ref No', 'REF_NO', 'reference_no', 'ReferenceNo', 'Ref_No', 'ref_no'];
                const AMT_ALIASES = ['Amount', 'Amount (₹)', 'amount', 'AMOUNT', 'Amt', 'amt'];
                const DATE_ALIASES = ['Transaction Date', 'Date', 'date', 'DATE', 'transaction_date', 'TransactionDate', 'Txn Date', 'txn_date'];

                // Helper: find first matching key from aliases list, then fallback to regex
                const findKey = (row, aliases, fallbackRegex) => {
                    for (const alias of aliases) {
                        if (alias in row) return alias;
                    }
                    return Object.keys(row).find(k => fallbackRegex.test(k)) || null;
                };

                // Auto-detect reference and amount columns
                const refKey = mapping.reference in firstRow ? mapping.reference
                    : findKey(firstRow, REF_ALIASES, /ref/i) || mapping.reference;
                const amtKey = mapping.amount in firstRow ? mapping.amount
                    : findKey(firstRow, AMT_ALIASES, /amount|amt/i) || mapping.amount;

                console.log(`[ENGINE] ${sourceLabel} - Using refKey="${refKey}", amtKey="${amtKey}"`);

                if (!(refKey in firstRow) || !(amtKey in firstRow)) {
                    throw new Error(`Column Mapping Error in ${sourceLabel}: Could not find reference/amount columns. Found: [${Object.keys(firstRow).join(', ')}]`);
                }

                // Auto-detect the date column name
                const dateKey = findKey(firstRow, DATE_ALIASES, /^(transaction[_\s]?date|date|txn[_\s]?date)$/i);

                const allRows = provided.map(row => ({
                    amount: parseFloat(row[amtKey]) || 0,
                    reference_number: String(row[refKey] || '').trim(),
                    transaction_date: dateKey ? String(row[dateKey] || '').trim() : runDate
                })).filter(row => row.reference_number !== '');

                // --- Bug 1 Fix: Normalize and compare year, month, day as numbers ---
                const parseToDate = (val) => {
                    if (!val) return null;
                    const s = String(val).trim();
                    if (/^\d{5}$/.test(s)) {
                        return new Date(Math.round((parseFloat(s) - 25569) * 86400 * 1000));
                    }
                    // Try direct parse
                    let d = new Date(s);
                    if (!isNaN(d.getTime())) return d;
                    // Handle DD/MM/YYYY or DD-MM-YYYY
                    const parts = s.split(/[-\/]/);
                    if (parts.length === 3) {
                        const [a, b, c] = parts;
                        if (c.length === 4) return new Date(`${c}-${b}-${a}`); // YYYY-MM-DD
                        if (a.length === 4) return new Date(`${a}-${b}-${c}`); // YYYY-MM-DD
                    }
                    return null;
                };

                const targetDate = parseToDate(runDate);
                const dateFilteredRows = dateKey
                    ? allRows.filter(row => {
                        const rowDate = parseToDate(row.transaction_date);
                        if (!targetDate || !rowDate) return false;
                        return rowDate.getFullYear() === targetDate.getFullYear() &&
                               rowDate.getMonth() === targetDate.getMonth() &&
                               rowDate.getDate() === targetDate.getDate();
                    })
                    : allRows;

                if (dateKey && dateFilteredRows.length === 0) {
                    console.log(`[ENGINE] No rows for ${runDate} in ${sourceLabel}. Sample row date value:`, provided[0]?.[dateKey]);
                    throw new Error(`No rows found in ${sourceLabel} for date ${runDate}. Check your file's date column.`);
                }

                sourceData[i] = dateFilteredRows;
                totalRowsRead += dateFilteredRows.length;
                console.log(`>>> ENGINE: ${sourceLabel} | Filtered Rows: ${dateFilteredRows.length} (out of ${provided.length} total) for date ${runDate}`);

            } else if (sourceType === 'API-Based') {
                let apiResponse = manualData[i];
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
                sourceData[i] = apiResponse.map(item => {
                    const mappedItem = {};
                    if (apiMapping.length > 0) {
                        apiMapping.forEach(m => { if (m.apiField && m.dbColumn) mappedItem[m.dbColumn] = item[m.apiField]; });
                    } else {
                        Object.assign(mappedItem, item);
                    }
                    return {
                        amount: parseFloat(mappedItem[mapping.amount] || item[mapping.amount]) || 0,
                        reference_number: String(mappedItem[mapping.reference] || item[mapping.reference] || '').trim(),
                        transaction_date: mappedItem.transaction_date || item.transaction_date || runDate
                    };
                }).filter(row => row.reference_number !== '');
                totalRowsRead += apiResponse.length;
            } else {
                sourceData[i] = [];
            }
        }

        const sourceKeys = Object.keys(sourceData);
        if (sourceKeys.length < 1) throw new Error('Insufficient data sources.');

        const sourceA = sourceData[0] || [];
        const sourceB = sourceData[1] || [];

        const results = [];
        let matchedCount = 0;
        let exceptionCount = 0;

        // ── Step 1: Detect duplicates within each source ──────────────────────
        const countRefs = (rows) => {
            const counts = new Map();
            rows.forEach(r => counts.set(r.reference_number, (counts.get(r.reference_number) || 0) + 1));
            return counts;
        };

        const refCountA = countRefs(sourceA);
        const refCountB = countRefs(sourceB);

        const dupRefsA = new Set([...refCountA.entries()].filter(([, c]) => c > 1).map(([k]) => k));
        const dupRefsB = new Set([...refCountB.entries()].filter(([, c]) => c > 1).map(([k]) => k));

        // Track which rows have been handled
        const handledA = new Set();
        const handledB = new Set();

        // ── Step 2: Build a ref → rows map for Source B ───────────────────────
        const bByRef = new Map();
        sourceB.forEach((txn, idx) => {
            if (!bByRef.has(txn.reference_number)) bByRef.set(txn.reference_number, []);
            bByRef.get(txn.reference_number).push({ ...txn, _idx: idx });
        });

        // ── Step 3: Match each Source A row ───────────────────────────────────
        sourceA.forEach((txnA, idxA) => {
            const ref = txnA.reference_number;

            // Duplicate in Source A — flag and skip matching
            if (dupRefsA.has(ref)) {
                exceptionCount++;
                results.push({
                    run_id: runId, recon_master_id: masterConfig.id,
                    amount: txnA.amount, reference_number: ref,
                    result_type: 'Exception', exception_type: 'Duplicate in Source A',
                    detail: `Reference ${ref} appears ${refCountA.get(ref)} times in Source A`,
                    transaction_date: txnA.transaction_date || runDate, status: 'Open'
                });
                handledA.add(idxA);
                return;
            }

            const bMatches = bByRef.get(ref) || [];

            if (bMatches.length === 0) {
                // Reference exists in A but not in B
                exceptionCount++;
                results.push({
                    run_id: runId, recon_master_id: masterConfig.id,
                    amount: txnA.amount, reference_number: ref,
                    result_type: 'Exception', exception_type: 'Missing in Source B',
                    detail: `Reference ${ref} found in Source A but not in Source B`,
                    transaction_date: txnA.transaction_date || runDate, status: 'Open'
                });
                handledA.add(idxA);

            } else if (bMatches.length === 1) {
                const txnB = bMatches[0];
                handledA.add(idxA);
                handledB.add(txnB._idx);

                if (Math.abs(txnA.amount - txnB.amount) < 0.001) {
                    // Exact match
                    matchedCount++;
                    results.push({
                        run_id: runId, recon_master_id: masterConfig.id,
                        amount: txnA.amount, reference_number: ref,
                        result_type: 'Matched', transaction_date: txnA.transaction_date || runDate, status: 'Closed'
                    });
                } else {
                    // Same ref, different amount → Amount Mismatch
                    exceptionCount++;
                    results.push({
                        run_id: runId, recon_master_id: masterConfig.id,
                        amount: txnA.amount, reference_number: ref,
                        result_type: 'Exception', exception_type: 'Amount Mismatch',
                        detail: `Source A: ${txnA.amount}, Source B: ${txnB.amount}`,
                        transaction_date: txnA.transaction_date || runDate, status: 'Open'
                    });
                }

            } else {
                // 1-to-many: check if it's a 1-to-2 partial match (amounts sum to A)
                const totalB = bMatches.reduce((sum, t) => sum + t.amount, 0);
                handledA.add(idxA);
                bMatches.forEach(t => handledB.add(t._idx));

                if (bMatches.length === 2 && Math.abs(totalB - txnA.amount) < 0.001) {
                    // Partial Match (1 → 2, amounts add up) — must be manually reviewed
                    exceptionCount++;
                    results.push({
                        run_id: runId, recon_master_id: masterConfig.id,
                        amount: txnA.amount, reference_number: ref,
                        result_type: 'Exception', exception_type: 'Partial Match',
                        detail: `1-to-2 split: Source A ${txnA.amount} vs Source B ${bMatches[0].amount} + ${bMatches[1].amount}`,
                        transaction_date: txnA.transaction_date || runDate, status: 'Open'
                    });
                } else {
                    // General 1-to-many mismatch
                    exceptionCount++;
                    results.push({
                        run_id: runId, recon_master_id: masterConfig.id,
                        amount: txnA.amount, reference_number: ref,
                        result_type: 'Exception', exception_type: 'Amount Mismatch',
                        detail: `Source A: ${txnA.amount}, Source B total (${bMatches.length} rows): ${totalB}`,
                        transaction_date: txnA.transaction_date || runDate, status: 'Open'
                    });
                }
            }
        });

        // ── Step 4: Source B rows with no match in Source A ───────────────────
        sourceB.forEach((txnB, idxB) => {
            if (handledB.has(idxB)) return;

            // Duplicate in Source B
            if (dupRefsB.has(txnB.reference_number)) {
                exceptionCount++;
                results.push({
                    run_id: runId, recon_master_id: masterConfig.id,
                    amount: txnB.amount, reference_number: txnB.reference_number,
                    result_type: 'Exception', exception_type: 'Duplicate in Source B',
                    detail: `Reference ${txnB.reference_number} appears ${refCountB.get(txnB.reference_number)} times in Source B`,
                    transaction_date: txnB.transaction_date || runDate, status: 'Open'
                });
            } else {
                // Missing in Source A
                exceptionCount++;
                results.push({
                    run_id: runId, recon_master_id: masterConfig.id,
                    amount: txnB.amount, reference_number: txnB.reference_number,
                    result_type: 'Exception', exception_type: 'Missing in Source A',
                    detail: `Reference ${txnB.reference_number} found in Source B but not in Source A`,
                    transaction_date: txnB.transaction_date || runDate, status: 'Open'
                });
            }
        });

        const endTime = getISTTime();

        // 3. Finalize Run (Atomic Transaction)
        console.log(`>>> ENGINE: SAVING RUN HISTORY | ID: ${runId} | Product: ${masterConfig.name} | Date: ${runDate}`);
        
        await connection.query(
            'INSERT INTO run_history (id, product, status, trigger_type, matched_count, exception_count, run_date, run_time, start_time, end_time, total_rows, valid_rows, file_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [runId, masterConfig.name, 'Completed', triggerType, matchedCount, exceptionCount, runDate, 
             new Date().toLocaleTimeString('en-GB', { hour12: false }), 
             startTime, 
             endTime, 
             totalRowsRead, results.length, fileName]
        );


        console.log(`>>> ENGINE: RUN HISTORY SAVED SUCCESS | ID: ${runId}`);

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
                const priorityFor = (type) => {
                    if (type === 'Amount Mismatch' || type === 'Partial Match') return 'High';
                    if (type === 'Duplicate in Source A' || type === 'Duplicate in Source B') return 'Medium';
                    return 'High'; // Missing entries
                };
                const exValues = exceptionsOnly.map((e, idx) => [
                    `EX-${runId}-${idx + 1}`, e.amount, e.reference_number,
                    e.exception_type || 'Mismatch', '0 days', priorityFor(e.exception_type), 'Open',
                    masterConfig.id, runId, runDate, 'System', e.detail || e.reference_number, 'Operations'
                ]);
                await connection.query(
                    'INSERT INTO exceptions (id, amount, ref_no, type, age, priority, status, recon_master_id, run_id, run_date, source_type, unique_reference_number, assigned_role) VALUES ?',
                    [exValues]
                );
            }
        }

        // --- CARRY FORWARD AUTO-RESOLUTION STEP ---
        try {
            console.log(`[ENGINE] Starting carry forward exception check for runDate: ${runDate}`);
            
            // Fetch all unresolved exceptions for this master from previous run dates
            const [openExceptions] = await connection.query(
                "SELECT * FROM exceptions WHERE recon_master_id = ? AND status NOT IN ('Resolved', 'Closed') AND run_date < ?",
                [masterConfig.id, runDate]
            );
            
            console.log(`[ENGINE] Found ${openExceptions.length} unresolved carry forward exceptions to check.`);
            
            for (const ex of openExceptions) {
                // Check if today's Source A or Source B has a matching entry for this exception's reference number & amount
                const matchA = sourceA.find(row => 
                    row.reference_number === ex.ref_no && 
                    Math.abs(Number(row.amount) - Number(ex.amount)) < 0.001
                );
                const matchB = sourceB.find(row => 
                    row.reference_number === ex.ref_no && 
                    Math.abs(Number(row.amount) - Number(ex.amount)) < 0.001
                );

                if (matchA || matchB) {
                    console.log(`[ENGINE] Auto-resolving carry forward exception ${ex.id} (Ref: ${ex.ref_no}, Amount: ${ex.amount})`);
                    
                    // Update exception status to Resolved
                    await connection.query(
                        "UPDATE exceptions SET status = 'Resolved', remarks = ? WHERE id = ?",
                        [`automatically matched in subsequent run on ${runDate}`, ex.id]
                    );

                    // Log audit entry
                    const nowIST = getISTTime();
                    const logTime = nowIST.split(' ')[1];
                    await connection.query(
                        'INSERT INTO audit_logs (user_name, action, module, detail, log_time, log_date, type, forensic_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [
                            'System', 
                            'Carry Forward Resolved', 
                            masterConfig.name, 
                            `System automatically resolved carry forward exception ${ex.id} (Ref: ${ex.ref_no}, Amount: ${ex.amount})`, 
                            logTime, 
                            runDate, 
                            'Activity', 
                            `AUTO_RESOLVE_${ex.id}_${runId}`
                        ]
                    );
                }
            }
        } catch (carryForwardError) {
            console.error('[ENGINE] Error during carry forward exception check:', carryForwardError.message);
            throw carryForwardError;
        }

        await connection.query(
            'INSERT INTO audit_logs (user_name, action, module, detail, log_time, log_date, type, forensic_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            ['System', 'Recon Completed', masterConfig.name, `Batch ${runId} finalized. Matched: ${matchedCount}, Exceptions: ${exceptionCount}`, 
             endTime.split(' ')[1], runDate, 'Activity', `SUCCESS_${runId}`]
        );

        await connection.commit();
        return { success: true, runId, matchedCount, exceptionCount };

    } catch (err) {
        if (connection) {
            await connection.rollback();
            try {
                const nowIST = getISTTime();

                await connection.query(
                    'INSERT INTO run_history (id, product, status, trigger_type, matched_count, exception_count, run_date, run_time, start_time, end_time, total_rows, valid_rows, file_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [runId, masterConfig.name, 'Failed', triggerType, 0, 0, runDate, 
                     new Date().toLocaleTimeString('en-GB', { hour12: false }), 
                     startTime, 
                     nowIST, 
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
