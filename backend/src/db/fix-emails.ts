import '../load-env.js';
import { db } from './db.js';
import { users } from './schema.js';
import { sql } from 'drizzle-orm';

async function fixEmails() {
  console.log('🔧 Normalizing email casing in the database...');
  
  // Update all emails to lowercase
  await db.update(users).set({ 
    email: sql`LOWER(${users.email})` 
  });
  
  console.log('✅ All emails have been converted to lowercase.');
  process.exit(0);
}

fixEmails().catch(err => {
  console.error(err);
  process.exit(1);
});
