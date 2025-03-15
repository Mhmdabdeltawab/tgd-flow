-- Check if user_permissions table exists and create it if not
CREATE TABLE IF NOT EXISTS public.user_permissions (
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

-- Enable RLS on the user_permissions table
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create policy for user_permissions
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.user_permissions;
CREATE POLICY "Users can view their own permissions"
  ON public.user_permissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for admins to manage all permissions
DROP POLICY IF EXISTS "Admins can manage all permissions" ON public.user_permissions;
CREATE POLICY "Admins can manage all permissions"
  ON public.user_permissions
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_permissions;

-- Ensure the admin user has permissions
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