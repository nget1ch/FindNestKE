
import './src/load-env.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Client } = pg;

async function test() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
    try {
        await client.connect();
        console.log('Connected to DB');
        const db = drizzle(client);
        const res = await client.query('SELECT * FROM users WHERE email = $1 LIMIT 1', ['admin@example.com']);
        console.log('Rows:', res.rows.length);
        console.log('User:', JSON.stringify(res.rows[0], null, 2));
    } catch (e) {
        console.error('DATABASE_ERROR:', e);
    } finally {
        await client.end();
    }
}
test();
