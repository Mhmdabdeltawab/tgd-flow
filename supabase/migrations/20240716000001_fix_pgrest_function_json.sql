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
BEGIN
  -- For SELECT queries, use json_agg to convert result to JSON array
  IF position('SELECT' in upper(query)) = 1 THEN
    EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', query) INTO result_rows;
    RETURN COALESCE(result_rows, '[]'::jsonb);
  ELSE
    -- For non-SELECT queries, execute and return affected row count
    EXECUTE query;
    RETURN jsonb_build_object('affected_rows', (SELECT ROW_COUNT()));
  END IF;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.pgrest(text) TO authenticated;
