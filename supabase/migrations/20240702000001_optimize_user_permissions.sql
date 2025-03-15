-- Add index to user_permissions table for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- Add index to users table for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Optimize user_permissions queries
ALTER TABLE user_permissions SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE user_permissions SET (autovacuum_analyze_scale_factor = 0.02);

-- Enable realtime for user_permissions table only (users is already enabled)
alter publication supabase_realtime add table user_permissions;