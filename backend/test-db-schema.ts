import './src/load-env.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { users } from './src/db/schema.js';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const db = drizzle(client);

async function checkSchema() {
  await client.connect();
  console.log('🔍 Checking database schema...');
  
  try {
    // Check if verification_document column exists
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'verification_document'
    `);
    
    console.log('📋 verification_document column check:', result.rows);
    
    // Check account_status enum values
    const enumResult = await client.query(`
      SELECT enumlabel as status
      FROM pg_enum
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'account_status'
      )
      ORDER BY enumlabel
    `);
    
    console.log('📋 account_status enum values:', enumResult.rows);
    
    // Check users table structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Users table structure:');
    tableInfo.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.column_default || ''}`);
    });
    
  } catch (error: any) {
    console.error('❌ Schema check failed:', error.message);
  }
  
  await client.end();
}

checkSchema().catch(console.error);
