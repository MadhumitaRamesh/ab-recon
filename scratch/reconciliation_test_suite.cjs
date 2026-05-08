const API_URL = 'http://localhost:5001/api';

async function runTests() {
    console.log('🚀 INITIALIZING RECONCILIATION TEST SUITE\n');

    // TEST 1: Manual Run Success (API Verification)
    console.log('Test 1 — Manual run success:');
    try {
        const runId = 'TEST-MANUAL-001';
        const res = await fetch(`${API_URL}/run-history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: runId,
                product: 'Bank vs GL Recon',
                status: 'Completed',
                trigger_type: 'Manual',
                matched_count: '1000',
                exception_count: '5',
                run_date: '2026-05-08',
                run_time: '12:00:00',
                start_time: '12:00:00',
                end_time: '12:00:10'
            })
        });
        if (res.ok) {
            console.log('✅ PASS: API accepted manual run record.');
            // Verify Audit Log
            const auditRes = await fetch(`${API_URL}/audit-logs`);
            const logs = await auditRes.json();
            const hasLog = logs.some(l => l.detail && l.detail.includes(runId));
            console.log(hasLog ? '✅ PASS: Audit log entry verified.' : '❌ FAIL: Audit log entry missing.');
        } else {
            console.log('❌ FAIL: API rejected manual run record.');
        }
    } catch (e) { console.log('❌ ERROR:', e.message); }

    // TEST 3: API-triggered run success
    console.log('\nTest 3 — API-triggered run success:');
    console.log('⚠️  RESULT: UNSUPPORTED. Current backend does not have an execution engine endpoint (/api/recon/trigger). Only result storage is implemented.');

    // TEST 4 & 5: Cron simulation
    console.log('\nTest 4 — Cron run simulation:');
    console.log('⚠️  RESULT: UNSUPPORTED. No server-side scheduler (node-cron) or background recon service found in backend.');

    // TEST 6: Audit log completeness
    console.log('\nTest 6 — Audit log completeness:');
    try {
        const initialLogs = await fetch(`${API_URL}/audit-logs`).then(r => r.json());
        const startCount = initialLogs.length;
        
        // Log 3 actions
        await fetch(`${API_URL}/audit-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_name: 'TEST_USER', action: 'Test Action', module: 'Test', detail: 'T6-1', type: 'System' })
        });
        await fetch(`${API_URL}/audit-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_name: 'TEST_USER', action: 'Test Action', module: 'Test', detail: 'T6-2', type: 'System' })
        });
        await fetch(`${API_URL}/audit-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_name: 'TEST_USER', action: 'Test Action', module: 'Test', detail: 'T6-3', type: 'System' })
        });

        const finalLogs = await fetch(`${API_URL}/audit-logs`).then(r => r.json());
        if (finalLogs.length === startCount + 3) {
            console.log('✅ PASS: Precisely 3 audit logs added.');
        } else {
            console.log(`❌ FAIL: Expected ${startCount + 3} logs, found ${finalLogs.length}`);
        }
    } catch (e) { console.log('❌ ERROR:', e.message); }

    // TEST 8: Role-based access block
    console.log('\nTest 8 — Role-based access block:');
    console.log('❌ FAIL: Backend /api/run-history endpoint currently lacks middleware to enforce role-based 403 errors. Logic is restricted at the UI level only.');

    console.log('\n🏁 TEST SUITE CONCLUDED.');
}

runTests();
