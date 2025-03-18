-- Fix RLS policies for user_permissions table

-- First, check if RLS is enabled on the user_permissions table
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'user_permissions';

-- Drop existing policies on user_permissions table
DROP POLICY IF EXISTS "Users can view their own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can manage all permissions" ON user_permissions;

-- Create policy for users to view their own permissions
CREATE POLICY "Users can view their own permissions"
ON user_permissions FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for admins to manage all permissions
CREATE POLICY "Admins can manage all permissions"
ON user_permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Add policy for service role to manage all permissions
CREATE POLICY "Service role can manage all permissions"
ON user_permissions FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on user_permissions table
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'user_permissions';
