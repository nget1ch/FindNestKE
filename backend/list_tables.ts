
import './src/load-env.js';
import { db } from './src/db/db.js';
import { sql } from 'drizzle-orm';

async function list() {
    try {
        const res = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
list();
