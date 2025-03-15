-- Drop the existing pgrest function
DROP FUNCTION IF EXISTS public.pgrest(text);

-- Create an improved pgrest function that properly handles JSON results
CREATE OR REPLACE FUNCTION public.pgrest(query text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_rows JSONB;
  affected_rows INTEGER;
BEGIN
  -- For SELECT queries, use json_agg to convert result to JSON array
  IF position('SELECT' in upper(query)) = 1 THEN
    EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', query) INTO result_rows;
    RETURN COALESCE(result_rows, '[]'::jsonb);
  ELSE
    -- For non-SELECT queries, execute and return affected row count
    EXECUTE query;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN jsonb_build_object('affected_rows', affected_rows);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.pgrest(text) TO authenticated;

-- Create users table if it doesn't exist (for testing)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_permissions table if it doesn't exist (for testing)
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  permission TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_permissions table
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create a policy for users table
DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON public.users;
CREATE POLICY "Users are viewable by authenticated users"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Create a policy for user_permissions table
DROP POLICY IF EXISTS "Permissions are viewable by authenticated users" ON public.user_permissions;
CREATE POLICY "Permissions are viewable by authenticated users"
ON public.user_permissions FOR SELECT
TO authenticated
USING (true);
