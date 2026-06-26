-- Add is_admin and status columns to perfiles
-- is_admin: required by opa-admin auth gate middleware
-- status: required by opa-admin user management (suspend/ban actions)
ALTER TABLE perfiles
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'banned'));
