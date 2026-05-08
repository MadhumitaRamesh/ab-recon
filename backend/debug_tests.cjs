const API_URL = 'http://localhost:5001/api';

async function runFocusedTests() {
    console.log('🧪 DEBUGGING TEST SUITE...\n');

    let token = '';
    try {
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId: 'ABC001', password: 'password123' })
        });
        const data = await loginRes.json();
        token = data.token;
    } catch (e) {}

    const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    const todayObj = new Date();
    const today = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

    console.log('Target Date:', today);

    const resToday = await fetch(`${API_URL}/run-history?date=${today}`);
    const dataToday = await resToday.json();
    console.log('Runs Found:', dataToday.length);
    if (dataToday.length > 0) {
        console.log('First Run Date:', dataToday[0].run_date);
        console.log('Type of run_date:', typeof dataToday[0].run_date);
    }

    const dateMatches = (val, target) => {
        const dStr = typeof val === 'string' ? val.split('T')[0] : new Date(val).toLocaleDateString('en-CA');
        return dStr === target;
    };

    if (dataToday.length > 0) {
        console.log('Match Check:', dateMatches(dataToday[0].run_date, today));
    }
}

runFocusedTests();
