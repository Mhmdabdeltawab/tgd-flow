-- Create the pgrest function if it doesn't exist
CREATE OR REPLACE FUNCTION public.pgrest(query text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE query INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.pgrest(text) TO authenticated;
