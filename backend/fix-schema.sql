-- Manual schema fix for landlord verification system

-- Step 1: Add verification_document column
ALTER TABLE users ADD COLUMN verification_document VARCHAR(500);

-- Step 2: Update account_status enum
ALTER TYPE account_status RENAME TO account_status_old;

CREATE TYPE account_status AS ENUM (
  'pending',
  'approved', 
  'rejected',
  'active',
  'inactive',
  'locked'
);

-- Update existing columns to use new enum type
ALTER TABLE users 
ALTER COLUMN account_status TYPE account_status 
USING CASE 
  WHEN account_status = 'pending_verification' THEN 'pending'::account_status
  WHEN account_status = 'active' THEN 'active'::account_status
  WHEN account_status = 'inactive' THEN 'inactive'::account_status
  WHEN account_status = 'locked' THEN 'locked'::account_status
  ELSE 'pending'::account_status
END;

-- Drop old enum type
DROP TYPE account_status_old;

-- Step 3: Create indexes for better performance
CREATE INDEX idx_users_role_status ON users(role, account_status);
CREATE INDEX idx_users_verification_doc ON users(verification_document) WHERE verification_document IS NOT NULL;
