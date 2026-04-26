import './src/load-env.js';
import { Client } from 'pg';
import bcrypt from 'bcryptjs';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function createAdmin() {
  await client.connect();
  const email = 'tonykimu254@gmail.com';
  const password = 'Test@1234';
  const fullName = 'Tony Kimu';
  const phone = '0700000254'; // Made up

  try {
    const hash = await bcrypt.hash(password, 10);
    
    // Check if user exists
    const checkUser = await client.query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (checkUser.rows && checkUser.rows.length > 0) {
      console.log('User already exists, updating role to admin');
      const userId = checkUser.rows[0].user_id;
      await client.query("UPDATE users SET role = 'admin', account_status = 'approved' WHERE user_id = $1", [userId]);
      await client.query("UPDATE auth SET password_hash = $1 WHERE user_id = $2", [hash, userId]);
      console.log('Updated user role to admin and password to ' + password);
      return;
    }

    const userRes = await client.query(
      `INSERT INTO users (full_name, email, phone, role, account_status, region)
       VALUES ($1, $2, $3, 'admin', 'approved', 'Nairobi')
       RETURNING user_id`,
      [fullName, email, phone]
    );
    const userId = userRes.rows[0].user_id;

    await client.query(
      `INSERT INTO auth (user_id, password_hash)
       VALUES ($1, $2)`,
      [userId, hash]
    );

    console.log(`Successfully created admin user: ${email} with password: ${password}`);
  } catch (error: any) {
    console.error('Error creating admin:', error.message);
  } finally {
    await client.end();
  }
}

createAdmin();
