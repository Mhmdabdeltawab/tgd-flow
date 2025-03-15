-- Update RLS policies to ensure admin access
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins have full access" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all user data" ON public.users;
DROP POLICY IF EXISTS "Admins can insert user data" ON public.users;
DROP POLICY IF EXISTS "Admins can update user data" ON public.users;
DROP POLICY IF EXISTS "Admins can delete user data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- Create policies for the users table
CREATE POLICY "Admins have full access"
ON public.users
FOR ALL
USING (role = 'admin');

CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Update user_permissions policies
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins have full access" ON public.user_permissions;
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can view all permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can modify permissions" ON public.user_permissions;

-- Create policies for the user_permissions table
CREATE POLICY "Admins have full access"
ON public.user_permissions
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid() AND users.role = 'admin'
));

CREATE POLICY "Users can view their own permissions"
ON public.user_permissions
FOR SELECT
USING (user_id = auth.uid());

-- Make sure realtime is enabled for these tables
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