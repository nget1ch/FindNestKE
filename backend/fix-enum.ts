import './src/load-env.js';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function fixEnum() {
  await client.connect();
  console.log('🔧 Fixing account_status enum...');
  
  try {
    // First, let's see current enum values
    const currentEnum = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'account_status')
      ORDER BY enumlabel
    `);
    
    console.log('📋 Current enum values:', currentEnum.rows.map(r => r.enumlabel));
    
    // Update existing data first
    console.log('🔄 Updating existing data...');
    await client.query(`
      UPDATE users 
      SET account_status = 'pending' 
      WHERE account_status = 'pending_verification'
    `);
    
    // Drop default
    await client.query(`ALTER TABLE users ALTER COLUMN account_status DROP DEFAULT`);
    
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
    
    // Update column type
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN account_status TYPE account_status 
      USING account_status::text::account_status
    `);
    
    // Set new default
    await client.query(`ALTER TABLE users ALTER COLUMN account_status SET DEFAULT 'pending'::account_status`);
    
    // Drop old enum
    await client.query(`DROP TYPE account_status_old`);
    
    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, account_status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_verification_doc ON users(verification_document) WHERE verification_document IS NOT NULL`);
    
    console.log('✅ Enum fix completed successfully!');
    
    // Verify the fix
    const newEnum = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'account_status')
      ORDER BY enumlabel
    `);
    
    console.log('📋 New enum values:', newEnum.rows.map(r => r.enumlabel));
    
  } catch (error: any) {
    console.error('❌ Enum fix failed:', error.message);
    console.error('Details:', error.detail);
  }
  
  await client.end();
}

fixEnum().catch(console.error);
