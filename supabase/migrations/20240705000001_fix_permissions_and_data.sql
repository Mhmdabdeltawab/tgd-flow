-- Fix user_permissions table if it exists
DO $$
BEGIN
  -- Check if the user_permissions table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_permissions') THEN
    -- Make sure the admin user has permissions
    INSERT INTO public.user_permissions (user_id, dashboard, contracts, routing, shipments, suppliers, tanks, buyers, warehouses, terminals, storage_tanks, analytics, user_management)
    SELECT 
      id,
      '{"view": true, "edit": false, "delete": false}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": false, "delete": false}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb
    FROM public.users
    WHERE email = 'abdeltawab@tagaddod.com'
    AND NOT EXISTS (
      SELECT 1 FROM public.user_permissions WHERE user_id = users.id
    );
  ELSE
    -- Create the user_permissions table if it doesn't exist
    CREATE TABLE public.user_permissions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
      dashboard JSONB DEFAULT '{"view": true, "edit": false, "delete": false}',
      contracts JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      routing JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      shipments JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      suppliers JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      tanks JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      buyers JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      warehouses JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      terminals JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      storage_tanks JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      analytics JSONB DEFAULT '{"view": true, "edit": false, "delete": false}',
      user_management JSONB DEFAULT '{"view": false, "edit": false, "delete": false}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add admin user permissions
    INSERT INTO public.user_permissions (user_id, dashboard, contracts, routing, shipments, suppliers, tanks, buyers, warehouses, terminals, storage_tanks, analytics, user_management)
    SELECT 
      id,
      '{"view": true, "edit": false, "delete": false}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": false, "delete": false}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb
    FROM public.users
    WHERE email = 'abdeltawab@tagaddod.com';
  END IF;

  -- Make sure RLS is disabled for easier development
  ALTER TABLE IF EXISTS public.user_permissions DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.parties DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.contracts DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.shipments DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.tanks DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.documents DISABLE ROW LEVEL SECURITY;

  -- Add realtime support for all tables
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_permissions;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.parties;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.contracts;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tanks;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;

  -- Create sample data if tables are empty
  IF NOT EXISTS (SELECT 1 FROM public.parties LIMIT 1) THEN
    -- Create test parties (suppliers and buyers)
    INSERT INTO public.parties (id, type, name, email, phone, address, country, city, contact_person, created_at, updated_at)
    VALUES
      (gen_random_uuid(), 'supplier', 'Green Palm Suppliers', 'contact@greenpalm.com', '+1-555-123-4567', '123 Palm Avenue', 'Malaysia', 'Kuala Lumpur', 'John Smith', NOW(), NOW()),
      (gen_random_uuid(), 'supplier', 'Eco Oils Inc.', 'sales@ecooils.com', '+1-555-987-6543', '456 Eco Street', 'Indonesia', 'Jakarta', 'Sarah Johnson', NOW(), NOW()),
      (gen_random_uuid(), 'buyer', 'Global Foods Corp', 'procurement@globalfoods.com', '+1-555-456-7890', '789 Global Road', 'United States', 'Chicago', 'Michael Brown', NOW(), NOW()),
      (gen_random_uuid(), 'buyer', 'Organic Products Ltd', 'orders@organicproducts.com', '+1-555-789-0123', '101 Organic Lane', 'United Kingdom', 'London', 'Emma Wilson', NOW(), NOW());
  END IF;

  -- Create contracts if none exist
  IF NOT EXISTS (SELECT 1 FROM public.contracts LIMIT 1) THEN
    -- Get supplier and buyer IDs
    DO $inner$
    DECLARE
      supplier1_id UUID;
      supplier2_id UUID;
      buyer1_id UUID;
      buyer2_id UUID;
      contract1_id UUID;
      contract2_id UUID;
      contract3_id UUID;
    BEGIN
      -- Get supplier IDs
      SELECT id INTO supplier1_id FROM parties WHERE name = 'Green Palm Suppliers' LIMIT 1;
      SELECT id INTO supplier2_id FROM parties WHERE name = 'Eco Oils Inc.' LIMIT 1;
      
      -- Get buyer IDs
      SELECT id INTO buyer1_id FROM parties WHERE name = 'Global Foods Corp' LIMIT 1;
      SELECT id INTO buyer2_id FROM parties WHERE name = 'Organic Products Ltd' LIMIT 1;
      
      -- Create test contracts
      INSERT INTO public.contracts (id, type, status, buyer_id, seller_id, buyer_name, seller_name, product_type, incoterm, quantity, allowed_variance, unit_price, currency, payment_terms, quality_ffa, quality_iv, quality_s, quality_m1, packing_standard, origin_country, delivery_country, delivery_port, loading_start_date, loading_period, loading_duration, delivery_date, created_at, updated_at)
      VALUES
        (gen_random_uuid(), 'Supply', 'opened', buyer1_id, supplier1_id, 'Global Foods Corp', 'Green Palm Suppliers', 'CPO', 'FOB', '5000', '5%', '750.00', 'USD', 'Net 30', '3.5', '53', '0.15', '0.2', 'Standard', 'Malaysia', 'United States', 'Chicago', '2024-07-01', '15', 'month', '2024-09-30', NOW(), NOW()),
        (gen_random_uuid(), 'Supply', 'opened', buyer2_id, supplier2_id, 'Organic Products Ltd', 'Eco Oils Inc.', 'RBDPO', 'CIF', '12000', '3%', '820.00', 'USD', 'Net 45', '3.2', '52', '0.12', '0.18', 'Premium', 'Indonesia', 'United Kingdom', 'London', '2024-01-01', '30', 'quarter', '2024-12-31', NOW(), NOW()),
        (gen_random_uuid(), 'Sales', 'pending', buyer2_id, supplier1_id, 'Organic Products Ltd', 'Green Palm Suppliers', 'PKO', 'FOB', '2000', '2%', '950.00', 'USD', 'Net 60', '3.8', '54', '0.14', '0.22', 'Standard', 'Malaysia', 'United Kingdom', 'London', '2024-07-15', '10', 'week', '2024-08-15', NOW(), NOW());
    END $inner$;
  END IF;

  -- Create shipments if none exist
  IF NOT EXISTS (SELECT 1 FROM public.shipments LIMIT 1) THEN
    -- Get contract IDs and create shipments
    DO $inner$
    DECLARE
      contract_id UUID;
      shipment1_id UUID;
      shipment2_id UUID;
      shipment3_id UUID;
    BEGIN
      -- Get first contract ID
      SELECT id INTO contract_id FROM contracts LIMIT 1;
      
      -- Create test shipments
      INSERT INTO public.shipments (id, contract_id, status, quantity, departure_date, arrival_date, origin_country, destination_country, destination_port, is_fulfilled, quality, created_at, updated_at)
      VALUES
        (gen_random_uuid(), contract_id, 'In Transit', 1000, '2024-07-05', '2024-07-25', 'Malaysia', 'United States', 'Chicago', false, '{"FFA": 3.5, "IV": 53, "S": 0.15, "MI": 0.2}'::jsonb, NOW(), NOW()),
        (gen_random_uuid(), contract_id, 'Scheduled', 1000, '2024-08-10', '2024-08-30', 'Malaysia', 'United States', 'Chicago', false, null, NOW(), NOW());
      
      -- Get second contract ID
      SELECT id INTO contract_id FROM contracts WHERE id != contract_id LIMIT 1;
      
      -- Create another shipment for the second contract
      INSERT INTO public.shipments (id, contract_id, status, quantity, departure_date, arrival_date, origin_country, destination_country, destination_port, is_fulfilled, quality, created_at, updated_at)
      VALUES
        (gen_random_uuid(), contract_id, 'Delivered', 2000, '2024-06-15', '2024-07-05', 'Indonesia', 'United Kingdom', 'London', true, '{"FFA": 3.1, "IV": 51, "S": 0.11, "MI": 0.17}'::jsonb, NOW(), NOW());
    END $inner$;
  END IF;

  -- Create tanks if none exist
  IF NOT EXISTS (SELECT 1 FROM public.tanks LIMIT 1) THEN
    -- Get shipment IDs and create tanks
    DO $inner$
    DECLARE
      shipment_rec RECORD;
    BEGIN
      -- For each shipment, create tanks
      FOR shipment_rec IN SELECT id, status, departure_date, arrival_date FROM shipments LOOP
        INSERT INTO public.tanks (id, shipment_id, status, quantity, quality, departure_date, arrival_date, created_at, updated_at)
        VALUES
          (shipment_rec.id || '-TNK-001', shipment_rec.id, shipment_rec.status, 500, '{"FFA": 3.5, "IV": 53, "S": 0.15, "MI": 0.2}'::jsonb, shipment_rec.departure_date, shipment_rec.arrival_date, NOW(), NOW()),
          (shipment_rec.id || '-TNK-002', shipment_rec.id, shipment_rec.status, 500, '{"FFA": 3.2, "IV": 52, "S": 0.12, "MI": 0.18}'::jsonb, shipment_rec.departure_date, shipment_rec.arrival_date, NOW(), NOW());
      END LOOP;
    END $inner$;
  END IF;
END $$;