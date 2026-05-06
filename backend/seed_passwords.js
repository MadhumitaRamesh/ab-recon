const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const db = mysql.createConnection({
    socketPath: '/tmp/mysql.sock',
    user: 'root',
    password: 'root',
    database: 'ab_recon_db'
});

// Users and their plaintext passwords
const users = [
    { employee_id: 'ABC001', password: 'Admin@123' },
    { employee_id: 'ABC002', password: 'Maker@123' },
    { employee_id: 'ABC003', password: 'Checker@123' }
];

async function hashAndSave() {
    for (const u of users) {
        const hash = await bcrypt.hash(u.password, 10);
        await new Promise((resolve, reject) => {
            db.query(
                'UPDATE users SET password_hash = ? WHERE employee_id = ?',
                [hash, u.employee_id],
                (err) => { if (err) reject(err); else resolve(); }
            );
        });
        console.log(`✅ Password hashed for ${u.employee_id} (plaintext: ${u.password})`);
    }
    console.log('\n✅ All passwords encrypted with bcrypt (salt rounds: 10) and saved to MySQL.');
    db.end();
}

hashAndSave().catch(console.error);
