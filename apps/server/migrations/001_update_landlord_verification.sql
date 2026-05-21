-- Migration: Update User Schema for Landlord Verification System
-- Description: Add verification document field and update account status enum

-- Step 1: Add verification_document column to users table
ALTER TABLE users 
ADD COLUMN verification_document VARCHAR(500);

-- Step 2: Update account status enum to include new values
-- Note: This approach may vary depending on your PostgreSQL version
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

-- Step 3: Update existing landlord accounts to 'pending' status
UPDATE users 
SET account_status = 'pending' 
WHERE role = 'landlord' AND account_status = 'active';

-- Step 4: Update existing tenant accounts to 'active' status  
UPDATE users 
SET account_status = 'active' 
WHERE role = 'tenant' AND account_status = 'pending';

-- Step 5: Create indexes for better performance
CREATE INDEX idx_users_role_status ON users(role, account_status);
CREATE INDEX idx_users_verification_doc ON users(verification_document) WHERE verification_document IS NOT NULL;

-- Step 6: Add comments for documentation
COMMENT ON COLUMN users.verification_document IS 'URL to landlord verification document (National ID, property ownership document, or lease agreement)';
COMMENT ON COLUMN users.account_status IS 'Account status: pending, approved, rejected, active, inactive, locked';

-- Migration completed successfully
