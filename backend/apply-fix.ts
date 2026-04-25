import './src/load-env.js';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function applySchemaFix() {
  await client.connect();
  console.log('🔧 Applying schema fixes...');
  
  try {
    // Step 1: Add verification_document column
    console.log('➕ Adding verification_document column...');
    await client.query(`ALTER TABLE users ADD COLUMN verification_document VARCHAR(500)`);
    console.log('✅ verification_document column added');
    
    // Step 2: Update account_status enum
    console.log('🔄 Updating account_status enum...');
    
    // Rename old enum
    await client.query(`ALTER TYPE account_status RENAME TO account_status_old`);
    
    // Create new enum
    await client.query(`
      CREATE TYPE account_status AS ENUM (
        'pending',
        'approved', 
        'rejected',
        'active',
        'inactive',
        'locked'
      )
    `);
    
    // Drop default first, then update column type
    await client.query(`ALTER TABLE users ALTER COLUMN account_status DROP DEFAULT`);
    
    // Update existing columns
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN account_status TYPE account_status 
      USING CASE 
        WHEN account_status = 'pending_verification' THEN 'pending'::account_status
        WHEN account_status = 'active' THEN 'active'::account_status
        WHEN account_status = 'inactive' THEN 'inactive'::account_status
        WHEN account_status = 'locked' THEN 'locked'::account_status
        ELSE 'pending'::account_status
      END
    `);
    
    // Set new default
    await client.query(`ALTER TABLE users ALTER COLUMN account_status SET DEFAULT 'pending'::account_status`);
    
    // Drop old enum
    await client.query(`DROP TYPE account_status_old`);
    console.log('✅ account_status enum updated');
    
    // Step 3: Create indexes
    console.log('📊 Creating indexes...');
    await client.query(`CREATE INDEX idx_users_role_status ON users(role, account_status)`);
    await client.query(`CREATE INDEX idx_users_verification_doc ON users(verification_document) WHERE verification_document IS NOT NULL`);
    console.log('✅ Indexes created');
    
    console.log('🎉 Schema fixes applied successfully!');
    
  } catch (error: any) {
    console.error('❌ Schema fix failed:', error.message);
    console.error('Details:', error.detail);
  }
  
  await client.end();
}

applySchemaFix().catch(console.error);
