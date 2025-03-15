-- Enable RLS for users table
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all user data" ON public.users;
DROP POLICY IF EXISTS "Admins can insert user data" ON public.users;
DROP POLICY IF EXISTS "Admins can update user data" ON public.users;
DROP POLICY IF EXISTS "Admins can delete user data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- Create policies for the users table
-- 1. Users can view their own data
CREATE POLICY "Users can view their own data"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- 2. Admins can view all user data (based on role)
CREATE POLICY "Admins can view all user data"
ON public.users FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid() AND users.role = 'admin'
));

-- 3. Admins can insert user data
CREATE POLICY "Admins can insert user data"
ON public.users FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid() AND users.role = 'admin'
));

-- 4. Admins can update user data
CREATE POLICY "Admins can update user data"
ON public.users FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid() AND users.role = 'admin'
));

-- 5. Admins can delete user data
CREATE POLICY "Admins can delete user data"
ON public.users FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid() AND users.role = 'admin'
));

-- 6. Users can update their own data (limited fields)
CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Make sure user_permissions table also has RLS enabled
ALTER TABLE IF EXISTS public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can view all permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can modify permissions" ON public.user_permissions;

-- Create policies for user_permissions table
-- 1. Users can view their own permissions
CREATE POLICY "Users can view their own permissions"
ON public.user_permissions FOR SELECT
USING (user_id = auth.uid());

-- 2. Admins can view all permissions
CREATE POLICY "Admins can view all permissions"
ON public.user_permissions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid() AND users.role = 'admin'
));

-- 3. Admins can modify permissions
CREATE POLICY "Admins can modify permissions"
ON public.user_permissions FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid() AND users.role = 'admin'
));

-- Check if tables are already in the realtime publication before adding them
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'user_permissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_permissions;
  END IF;
END
$$;