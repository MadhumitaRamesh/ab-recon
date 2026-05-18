const { Pool } = require('pg');
require('dotenv').config();

// Override date and decimal parsing in pg driver to return raw values, matching mysql2 expectations
const pg = require('pg');
pg.types.setTypeParser(1082, val => val); // date as string
pg.types.setTypeParser(1083, val => val); // time as string
pg.types.setTypeParser(1114, val => val); // timestamp as string
pg.types.setTypeParser(1700, val => parseFloat(val)); // numeric/decimal as float

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://root:root@localhost:5432/ab_recon_db',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Configure timezone offset (Asia/Kolkata) on every new client connection
pool.on('connect', (client) => {
    client.query("SET TIMEZONE TO 'Asia/Kolkata'").catch(err => console.error("Error setting timezone:", err));
});

/**
 * Robustly converts MySQL query syntax and parameter formatting to PostgreSQL conventions.
 */
function convertQuery(sql, values) {
    let pgSql = sql;
    let pgValues = [...(values || [])];
    
    // 1. Bulk Insert pattern: values is a single-element array containing a nested array
    // e.g. [[['val1', 'val2'], ['val3', 'val4']]]
    if (values && values.length === 1 && Array.isArray(values[0]) && Array.isArray(values[0][0])) {
        const rows = values[0];
        const rowLength = rows[0].length;
        const placeholders = [];
        let pIndex = 1;
        pgValues = [];
        for (let i = 0; i < rows.length; i++) {
            const rowPlaceholders = [];
            for (let j = 0; j < rowLength; j++) {
                rowPlaceholders.push(`$${pIndex++}`);
                pgValues.push(rows[i][j]);
            }
            placeholders.push(`(${rowPlaceholders.join(', ')})`);
        }
        pgSql = pgSql.replace(/VALUES\s*\??\s*\(?\??\)?/i, 'VALUES ' + placeholders.join(', '));
    } else {
        // 2. Regular query: Convert '?' placeholders to standard positional '$1', '$2', ...
        let index = 1;
        pgSql = pgSql.replace(/\?/g, () => `$${index++}`);
    }
    
    // 3. MySQL 'ON DUPLICATE KEY UPDATE' to PostgreSQL 'ON CONFLICT'
    if (/ON DUPLICATE KEY UPDATE/i.test(pgSql)) {
        pgSql = pgSql.replace(/ON DUPLICATE KEY UPDATE/i, 'ON CONFLICT (recon_master_id, source_label) DO UPDATE SET');
    }
    
    // 4. Mimic auto-incrementing ID retrieval (insertId) by adding 'RETURNING id'
    if (/^\s*INSERT\s+INTO/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
        pgSql += ' RETURNING id';
    }
    
    return { sql: pgSql, values: pgValues };
}

/**
 * Mimics mysql2 query execution result shapes.
 */
function formatResult(sql, pgRes) {
    if (!pgRes) return null;
    
    // SELECT queries return the rows array directly
    if (/^\s*SELECT/i.test(sql)) {
        return pgRes.rows || [];
    }
    
    // INSERT/UPDATE/DELETE queries return an OkPacket emulated structure
    const resultObj = {
        affectedRows: pgRes.rowCount || 0,
        insertId: pgRes.rows && pgRes.rows[0] && pgRes.rows[0].id ? pgRes.rows[0].id : null,
        warningStatus: 0
    };
    
    // Extend the result object to support direct row reads (array-like wrapper)
    return Object.assign(pgRes.rows || [], resultObj);
}

class ConnectionWrapper {
    constructor(client) {
        this.client = client;
    }
    
    async query(sql, values) {
        const converted = convertQuery(sql, values);
        const res = await this.client.query(converted.sql, converted.values);
        return [formatResult(sql, res)];
    }
    
    async beginTransaction() {
        await this.client.query('BEGIN');
    }
    
    async commit() {
        await this.client.query('COMMIT');
    }
    
    async rollback() {
        await this.client.query('ROLLBACK');
    }
    
    release() {
        this.client.release();
    }
}

class PromiseWrapper {
    constructor(pool) {
        this.pool = pool;
    }
    
    async query(sql, values) {
        const converted = convertQuery(sql, values);
        const res = await this.pool.query(converted.sql, converted.values);
        return [formatResult(sql, res)];
    }
    
    async getConnection() {
        const client = await this.pool.connect();
        return new ConnectionWrapper(client);
    }
}

const db = {
    pool,
    query(sql, values, callback) {
        if (typeof values === 'function') {
            callback = values;
            values = [];
        }
        
        const converted = convertQuery(sql, values);
        this.pool.query(converted.sql, converted.values, (err, res) => {
            if (callback) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, formatResult(sql, res));
                }
            }
        });
    },
    getConnection(callback) {
        this.pool.connect((err, client, done) => {
            if (err) {
                if (callback) callback(err);
            } else {
                const connection = new ConnectionWrapper(client);
                connection.release = () => done();
                if (callback) callback(null, connection);
            }
        });
    },
    promise() {
        return new PromiseWrapper(this.pool);
    }
};

module.exports = db;
