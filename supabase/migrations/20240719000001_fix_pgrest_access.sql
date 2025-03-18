-- Create a function to check if pgrest exists
CREATE OR REPLACE FUNCTION check_pgrest_exists()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM pg_proc 
    WHERE proname = 'pgrest'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_pgrest_exists() TO authenticated;

-- Ensure pgrest function exists if it doesn't already
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'pgrest') THEN
    -- Create the pgrest function
    EXECUTE 'CREATE OR REPLACE FUNCTION pgrest(query text)
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $func$
    BEGIN
      RETURN (EXECUTE query);
    EXCEPTION WHEN OTHERS THEN
      RETURN json_build_object(''error'', SQLERRM);
    END;
    $func$';
    
    -- Grant execute permission to authenticated users
    EXECUTE 'GRANT EXECUTE ON FUNCTION pgrest(text) TO authenticated';
  END IF;
END;
$$;