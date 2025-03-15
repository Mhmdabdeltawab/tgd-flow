-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_permissions table
ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;

-- Add tables to realtime publication
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table user_permissions;
