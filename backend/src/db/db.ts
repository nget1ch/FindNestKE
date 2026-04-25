import '../load-env.js';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

let _dbInstance: NodePgDatabase<typeof schema> | null = null;

export const getDatabase = () => {
  if (!_dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is missing in environment variables');
    }

    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20, 
      min: 2, 
      idleTimeoutMillis: 30000, 
      connectionTimeoutMillis: 15000, 
    });

    _dbInstance = drizzle(pool, { schema });
  }
  return _dbInstance;
};

// Export a proxy that lazily initializes the database with full schema support
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(target, prop) {
    const dbInstance = getDatabase();
    return dbInstance[prop as keyof typeof dbInstance];
  }
});
