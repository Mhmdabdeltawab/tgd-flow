-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_permissions table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_permissions') THEN
        ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Add tables to realtime publication
alter publication supabase_realtime add table users;

-- Add user_permissions to realtime if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_permissions') THEN
        alter publication supabase_realtime add table user_permissions;
    END IF;
END
$$;