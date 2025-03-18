-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.check_pgrest_exists();
DROP FUNCTION IF EXISTS public.pgrest(text);

-- Create a simple function to check RLS status
CREATE OR REPLACE FUNCTION public.get_rls_status()
RETURNS TABLE (
  table_name text,
  has_rls boolean,
  policies text[]
) SECURITY DEFINER
LANGUAGE sql
AS $$
  WITH table_rls AS (
    SELECT 
      n.nspname AS schema_name,
      c.relname AS table_name,
      CASE WHEN c.relrowsecurity THEN true ELSE false END AS has_rls
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relkind = 'r'
  ),
  policies AS (
    SELECT 
      schemaname,
      tablename,
      array_agg(policyname) as policies
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY schemaname, tablename
  )
  SELECT 
    t.table_name,
    t.has_rls,
    COALESCE(p.policies, ARRAY[]::text[]) as policies
  FROM table_rls t
  LEFT JOIN policies p ON t.table_name = p.tablename AND t.schema_name = p.schemaname
  ORDER BY t.table_name;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_rls_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_rls_status() TO anon;
