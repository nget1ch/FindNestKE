import '../load-env.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

let _dbInstance: ReturnType<typeof drizzle> | null = null;

export const getDatabase = () => {
  if (!_dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is missing in environment variables');
    }

    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5, // Reduced pool size for faster startup
      min: 1, // Minimum connections
      idleTimeoutMillis: 1000, // Much shorter idle timeout
      connectionTimeoutMillis: 1000, // Faster connection timeout
      acquireTimeoutMillis: 1000, // Faster acquire timeout
      createTimeoutMillis: 1000, // Faster creation timeout
      destroyTimeoutMillis: 1000, // Faster destroy timeout
      reapIntervalMillis: 1000, // More frequent cleanup
      createRetryIntervalMillis: 100, // Faster retry on connection failure
    });

    _dbInstance = drizzle(pool, { schema });
  }
  return _dbInstance;
};

// Export a proxy that lazily initializes the database
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const dbInstance = getDatabase();
    return dbInstance[prop as keyof typeof dbInstance];
  }
});
