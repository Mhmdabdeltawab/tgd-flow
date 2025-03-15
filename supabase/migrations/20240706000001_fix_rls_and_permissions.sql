-- Disable RLS on all tables for easier development
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

-- Fix user_permissions table
DO $$
BEGIN
  -- Check if the user_permissions table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_permissions') THEN
    -- Make sure the admin user has permissions
    INSERT INTO public.user_permissions (user_id, dashboard, contracts, routing, shipments, suppliers, tanks, buyers, warehouses, terminals, storage_tanks, analytics, user_management)
    SELECT 
      id,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
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
      dashboard JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      contracts JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      routing JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      shipments JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      suppliers JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      tanks JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      buyers JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      warehouses JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      terminals JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      storage_tanks JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      analytics JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      user_management JSONB DEFAULT '{"view": true, "edit": true, "delete": true}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add admin user permissions
    INSERT INTO public.user_permissions (user_id, dashboard, contracts, routing, shipments, suppliers, tanks, buyers, warehouses, terminals, storage_tanks, analytics, user_management)
    SELECT 
      id,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb,
      '{"view": true, "edit": true, "delete": true}'::jsonb
    FROM public.users
    WHERE email = 'abdeltawab@tagaddod.com';
  END IF;

  -- Update existing permissions to have full access
  UPDATE public.user_permissions
  SET 
    dashboard = '{"view": true, "edit": true, "delete": true}'::jsonb,
    contracts = '{"view": true, "edit": true, "delete": true}'::jsonb,
    routing = '{"view": true, "edit": true, "delete": true}'::jsonb,
    shipments = '{"view": true, "edit": true, "delete": true}'::jsonb,
    suppliers = '{"view": true, "edit": true, "delete": true}'::jsonb,
    tanks = '{"view": true, "edit": true, "delete": true}'::jsonb,
    buyers = '{"view": true, "edit": true, "delete": true}'::jsonb,
    warehouses = '{"view": true, "edit": true, "delete": true}'::jsonb,
    terminals = '{"view": true, "edit": true, "delete": true}'::jsonb,
    storage_tanks = '{"view": true, "edit": true, "delete": true}'::jsonb,
    analytics = '{"view": true, "edit": true, "delete": true}'::jsonb,
    user_management = '{"view": true, "edit": true, "delete": true}'::jsonb
  WHERE EXISTS (
    SELECT 1 FROM public.users WHERE users.id = user_permissions.user_id AND users.role = 'admin'
  );

  -- Make sure we have at least one admin user
  INSERT INTO public.users (email, name, role, created_at, updated_at)
  SELECT 
    'abdeltawab@tagaddod.com',
    'Abdeltawab',
    'admin',
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'abdeltawab@tagaddod.com'
  );

END $$;