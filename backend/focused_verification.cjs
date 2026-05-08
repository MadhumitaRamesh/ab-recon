/**
 * Focused Verification Suite — Dynamic Recon & Advanced Filtering
 * Tests the 5 core changes: dynamic engine, history filters, exception filters, forensic traceability
 */
const API_URL = 'http://localhost:5001/api';

// Converts MySQL date (either ISO string like "2026-05-07T18:30:00.000Z" or "2026-05-08") 
// to a YYYY-MM-DD string using LOCAL timezone
function toLocalDateStr(val) {
    if (!val) return '';
    const d = new Date(val);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// Build today's date as YYYY-MM-DD using local timezone
function localToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

async function runFocusedTests() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 FOCUSED VERIFICATION SUITE — 11 Tests');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let pass = 0, fail = 0;
    const results = [];

    const report = (name, passed, reason = '') => {
        const icon = passed ? '✅ PASS' : '❌ FAIL';
        const msg = passed ? `${icon}: ${name}` : `${icon}: ${name}${reason ? ' — ' + reason : ''}`;
        console.log(msg);
        results.push({ name, passed, reason });
        passed ? pass++ : fail++;
    };

    // ── SETUP: Authenticate ─────────────────────────────────────────────────
    let token = '';
    try {
        const r = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId: 'ABC001', password: 'password123' })
        });
        const d = await r.json();
        token = d.token || '';
    } catch(e) { console.error('❌ Auth Failed:', e.message); }

    const AUTH = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    const TODAY = localToday();
    console.log(`   Local date used for tests: ${TODAY}\n`);

    // Discover Master ID for "Cash Back"
    let masterId;
    const mRes = await fetch(`${API_URL}/masters`);
    const masters = await mRes.json();
    const cb = masters.find(m => m.name.includes('Cash Back'));
    if (cb) masterId = cb.id;
    console.log(`   Cash Back master ID: ${masterId}\n`);

    // ── TEST 1: Dynamic Query Building ──────────────────────────────────────
    console.log('--- TEST 1: Dynamic Query Building ---');
    try {
        // 1a: Successful run with automatic internal source
        const r = await fetch(`${API_URL}/recon/trigger`, {
            method: 'POST', headers: AUTH,
            body: JSON.stringify({ masterId, runDate: TODAY, triggerType: 'Manual' })
        });
        const d = await r.json();
        report('T1a: Engine uses automatic source config to build SQL query',
            r.status === 200 && d.success === true,
            `Status: ${r.status}, Data: ${JSON.stringify(d)}`);

        // 1b: Incompatible table (missing date/product columns)
        await fetch(`${API_URL}/masters/${masterId}`, {
            method: 'PUT', headers: AUTH,
            body: JSON.stringify({
                name: 'Cash Back Daily Automatic', frequency: 'Daily', matching_logic: '2-Way',
                run_mode: 'Automatic',
                source_config: [{ id: 1, name: 'Bad Table', type: 'Automatic', tableName: 'non_existent_table' }],
                status: 'Active'
            })
        });
        const badR = await fetch(`${API_URL}/recon/trigger`, {
            method: 'POST', headers: AUTH,
            body: JSON.stringify({ masterId, runDate: TODAY, triggerType: 'Manual' })
        });
        const badD = await badR.json();
        report('T1b: Incompatible table returns 400 with clear error (not a crash)',
            badR.status === 400 && typeof badD.error === 'string' && badD.error.includes('not compatible'),
            `Status: ${badR.status}, Error: "${badD.error}"`);

        // Restore master
        await fetch(`${API_URL}/masters/${masterId}`, {
            method: 'PUT', headers: AUTH,
            body: JSON.stringify({
                name: 'Cash Back Daily Automatic', frequency: 'Daily', matching_logic: '2-Way',
                run_mode: 'Automatic',
                source_config: [
                    { id: 1, name: 'Wallet DB', type: 'Automatic', tableName: 'wallet_txns' },
                    { id: 2, name: 'Marketing Ledger', type: 'Automatic', tableName: 'marketing_ledger' }
                ],
                status: 'Active'
            })
        });
    } catch(e) { report('T1: Error', false, e.message); }

    // ── TEST 2: Run History Date Filter ─────────────────────────────────────
    console.log('\n--- TEST 2: Run History Date Filter ---');
    try {
        const rToday = await fetch(`${API_URL}/run-history?date=${TODAY}`);
        const dToday = await rToday.json();
        const allMatchToday = dToday.every(r => toLocalDateStr(r.run_date) === TODAY);
        report('T2a: Date filter returns only today\'s runs',
            dToday.length > 0 && allMatchToday,
            `Count: ${dToday.length}, All match today: ${allMatchToday}`);

        const rAll = await fetch(`${API_URL}/run-history`);
        const dAll = await rAll.json();
        report('T2b: No parameters returns ALL records',
            dAll.length >= dToday.length,
            `All: ${dAll.length}, Today: ${dToday.length}`);

        const pastDate = '2025-01-01';
        const rPast = await fetch(`${API_URL}/run-history?date=${pastDate}`);
        const dPast = await rPast.json();
        report('T2c: Past date filter returns 0 results (no old data)',
            dPast.length === 0,
            `Past date count: ${dPast.length}`);
    } catch(e) { report('T2: Error', false, e.message); }

    // ── TEST 3: Run History Product Filter ──────────────────────────────────
    console.log('\n--- TEST 3: Run History Product Filter ---');
    try {
        const r = await fetch(`${API_URL}/run-history?master=Cash Back Daily Automatic`);
        const d = await r.json();
        const allMatch = d.every(row => row.product === 'Cash Back Daily Automatic');
        report('T3: Product filter returns only Cash Back runs',
            d.length > 0 && allMatch,
            `Count: ${d.length}, All match: ${allMatch}`);
    } catch(e) { report('T3: Error', false, e.message); }

    // ── TEST 4: Run History Status & Trigger Type ────────────────────────────
    console.log('\n--- TEST 4: Run History Status & Trigger Type Filters ---');
    try {
        const rComp = await fetch(`${API_URL}/run-history?status=Completed`);
        const dComp = await rComp.json();
        report('T4a: Status=Completed returns only completed runs',
            dComp.length > 0 && dComp.every(r => r.status === 'Completed'),
            `Count: ${dComp.length}`);

        const rFail = await fetch(`${API_URL}/run-history?status=Failed`);
        const dFail = await rFail.json();
        report('T4b: Status=Failed returns only failed runs (or empty)',
            dFail.every(r => r.status === 'Failed'),
            `Count: ${dFail.length}`);

        const rManual = await fetch(`${API_URL}/run-history?triggerType=Manual`);
        const dManual = await rManual.json();
        report('T4c: TriggerType=Manual returns only manual runs',
            dManual.length > 0 && dManual.every(r => r.trigger_type === 'Manual'),
            `Count: ${dManual.length}`);

        const rCron = await fetch(`${API_URL}/run-history?triggerType=Cron`);
        const dCron = await rCron.json();
        report('T4d: TriggerType=Cron returns only cron runs (or empty)',
            dCron.every(r => r.trigger_type === 'Cron'),
            `Count: ${dCron.length}`);
    } catch(e) { report('T4: Error', false, e.message); }

    // ── TEST 5: Run History Combined Filters ─────────────────────────────────
    console.log('\n--- TEST 5: Run History Combined Filters ---');
    try {
        const url = `${API_URL}/run-history?date=${TODAY}&master=Cash Back Daily Automatic&status=Completed&triggerType=Manual`;
        const r = await fetch(url);
        const d = await r.json();
        const allMatch = d.every(row =>
            toLocalDateStr(row.run_date) === TODAY &&
            row.product === 'Cash Back Daily Automatic' &&
            row.status === 'Completed' &&
            row.trigger_type === 'Manual'
        );
        report('T5: All 4 combined history filters work simultaneously',
            d.length > 0 && allMatch,
            `Count: ${d.length}, All match: ${allMatch}`);
    } catch(e) { report('T5: Error', false, e.message); }

    // ── TEST 6: Exception Date & Product Filters ──────────────────────────────
    console.log('\n--- TEST 6: Exception Date & Product Filters ---');
    try {
        const rDate = await fetch(`${API_URL}/exceptions?date=${TODAY}`);
        const dDate = await rDate.json();
        const allMatchDate = dDate.every(e => toLocalDateStr(e.run_date) === TODAY);
        report('T6a: Exception date filter returns only today\'s exceptions',
            dDate.length > 0 && allMatchDate,
            `Count: ${dDate.length}, All match today: ${allMatchDate}`);

        const rProd = await fetch(`${API_URL}/exceptions?master=Cash Back Daily Automatic`);
        const dProd = await rProd.json();
        const allMatchProd = dProd.every(e => e.product_name === 'Cash Back Daily Automatic');
        report('T6b: Exception product filter returns only Cash Back exceptions',
            dProd.length > 0 && allMatchProd,
            `Count: ${dProd.length}`);
    } catch(e) { report('T6: Error', false, e.message); }

    // ── TEST 7: Exception Type Filter ────────────────────────────────────────
    console.log('\n--- TEST 7: Exception Type Filter ---');
    try {
        const r = await fetch(`${API_URL}/exceptions?type=Amount Mismatch`);
        const d = await r.json();
        report('T7: Type=Amount Mismatch returns only matching exceptions',
            d.every(e => e.type === 'Amount Mismatch'),
            `Count: ${d.length}`);
    } catch(e) { report('T7: Error', false, e.message); }

    // ── TEST 8: Exception Priority Filter ────────────────────────────────────
    console.log('\n--- TEST 8: Exception Priority Filter ---');
    try {
        const rHigh = await fetch(`${API_URL}/exceptions?priority=High`);
        const dHigh = await rHigh.json();
        report('T8a: Priority=High returns only high priority exceptions',
            dHigh.length > 0 && dHigh.every(e => e.priority === 'High'),
            `Count: ${dHigh.length}`);

        const rLow = await fetch(`${API_URL}/exceptions?priority=Low`);
        const dLow = await rLow.json();
        report('T8b: Priority=Low returns only low priority exceptions (or empty)',
            dLow.every(e => e.priority === 'Low'),
            `Count: ${dLow.length}`);
    } catch(e) { report('T8: Error', false, e.message); }

    // ── TEST 9: Exception Status Filter ──────────────────────────────────────
    console.log('\n--- TEST 9: Exception Status Filter ---');
    try {
        const rPend = await fetch(`${API_URL}/exceptions?status=Pending`);
        const dPend = await rPend.json();
        report('T9a: Status=Pending returns only pending exceptions',
            dPend.length > 0 && dPend.every(e => e.status === 'Pending'),
            `Count: ${dPend.length}`);

        const rResolved = await fetch(`${API_URL}/exceptions?status=Resolved`);
        const dResolved = await rResolved.json();
        report('T9b: Status=Resolved returns only resolved exceptions (or empty)',
            dResolved.every(e => e.status === 'Resolved'),
            `Count: ${dResolved.length}`);
    } catch(e) { report('T9: Error', false, e.message); }

    // ── TEST 10: Exception Combined Filters ───────────────────────────────────
    console.log('\n--- TEST 10: Exception Combined Filters ---');
    try {
        const url = `${API_URL}/exceptions?date=${TODAY}&master=Cash Back Daily Automatic&priority=High&status=Pending`;
        const r = await fetch(url);
        const d = await r.json();
        const allMatch = d.every(e =>
            toLocalDateStr(e.run_date) === TODAY &&
            e.product_name === 'Cash Back Daily Automatic' &&
            e.priority === 'High' &&
            e.status === 'Pending'
        );
        report('T10: All 5 combined exception filters work simultaneously',
            d.length > 0 && allMatch,
            `Count: ${d.length}, All match: ${allMatch}`);
    } catch(e) { report('T10: Error', false, e.message); }

    // ── TEST 11: Forensic Traceability ────────────────────────────────────────
    console.log('\n--- TEST 11: Forensic Traceability ---');
    try {
        // Trigger a fresh run
        const trigR = await fetch(`${API_URL}/recon/trigger`, {
            method: 'POST', headers: AUTH,
            body: JSON.stringify({ masterId, runDate: TODAY, triggerType: 'Manual' })
        });
        const trigD = await trigR.json();
        const runId = trigD.runId;

        // Verify run_history
        const hR = await fetch(`${API_URL}/run-history?date=${TODAY}`);
        const hD = await hR.json();
        const inHistory = hD.some(r => r.id === runId);

        // Verify exceptions linked to same runId
        const eR = await fetch(`${API_URL}/exceptions?date=${TODAY}`);
        const eD = await eR.json();
        const inExceptions = eD.some(e => e.run_id === runId);

        // Verify audit log linked to same runId
        const aR = await fetch(`${API_URL}/audit-logs`);
        const aD = await aR.json();
        const inAudit = aD.some(a => a.detail && a.detail.includes(runId));

        report('T11a: Run appears in run_history with correct batch ID', inHistory, `RunId: ${runId}, Found: ${inHistory}`);
        report('T11b: Exceptions are linked to same batch ID', inExceptions, `RunId: ${runId}, Found: ${inExceptions}`);
        report('T11c: Audit log entry linked to same batch ID', inAudit, `RunId: ${runId}, Found: ${inAudit}`);
    } catch(e) { report('T11: Error', false, e.message); }

    // ── FINAL REPORT ───────────────────────────────────────────────────────────
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🏁 VERIFICATION COMPLETE  |  ✅ PASSED: ${pass}  |  ❌ FAILED: ${fail}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

runFocusedTests().catch(console.error);
