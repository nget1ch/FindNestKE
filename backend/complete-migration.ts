import './src/load-env.js';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function completeMigration() {
  await client.connect();
  console.log('🔧 Completing enum migration...');
  
  try {
    // Check current state
    const columnInfo = await client.query(`
      SELECT column_default, data_type
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'account_status'
    `);
    
    console.log('📋 Current column info:', columnInfo.rows[0]);
    
    // Drop the default first
    console.log('🔄 Dropping default...');
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN account_status DROP DEFAULT
    `);
    
    // Update the column type to use the new enum
    console.log('🔄 Updating column type...');
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN account_status TYPE account_status 
      USING 'pending'::account_status
    `);
    
    // Set proper default
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN account_status SET DEFAULT 'pending'::account_status
    `);
    
    console.log('✅ Migration completed!');
    
    // Verify
    const verification = await client.query(`
      SELECT column_default, data_type
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'account_status'
    `);
    
    console.log('📋 Updated column info:', verification.rows[0]);
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error('Details:', error.detail);
  }
  
  await client.end();
}

completeMigration().catch(console.error);
