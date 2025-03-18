-- Convert existing party IDs to UUIDs if they aren't already

-- First, create a temporary UUID column
ALTER TABLE parties ADD COLUMN IF NOT EXISTS temp_uuid UUID DEFAULT gen_random_uuid();

-- Update the parties table to use UUIDs for IDs
ALTER TABLE parties ALTER COLUMN id TYPE UUID USING temp_uuid;

-- Drop the temporary column
ALTER TABLE parties DROP COLUMN IF EXISTS temp_uuid;

-- Update foreign keys in contracts table
ALTER TABLE contracts ALTER COLUMN buyer_id TYPE UUID USING gen_random_uuid();
ALTER TABLE contracts ALTER COLUMN seller_id TYPE UUID USING gen_random_uuid();

-- Add a trigger to ensure new parties always have UUID IDs
CREATE OR REPLACE FUNCTION ensure_uuid_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL OR NOT (NEW.id::TEXT ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
    NEW.id := gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_party_uuid_id ON parties;
CREATE TRIGGER ensure_party_uuid_id
BEFORE INSERT ON parties
FOR EACH ROW
EXECUTE FUNCTION ensure_uuid_id();
