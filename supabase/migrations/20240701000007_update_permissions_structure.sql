CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  dashboard JSONB NOT NULL DEFAULT '{"view": true, "edit": false, "delete": false}',
  contracts JSONB NOT NULL DEFAULT '{"view": false, "edit": false, "delete": false}',
  routing JSONB NOT NULL DEFAULT '{"view": false, "edit": false, "delete": false}',
  shipments JSONB NOT NULL DEFAULT '{"view": false, "edit": false, "delete": false}',
  suppliers JSONB NOT NULL DEFAULT '{"view": false, "edit": false, "delete": false}',
  tanks JSONB NOT NULL DEFAULT '{"view": false, "edit": false, "delete": false}',
  buyers JSONB NOT NULL DEFAULT '{"view": false, "edit": false, "delete": false}',
  warehouses JSONB NOT NULL DEFAULT '{"view": false, "edit": false, "delete": false}',
  terminals JSONB NOT NULL DEFAULT '{"view": false, "edit": false, "delete": false}',
  storage_tanks JSONB NOT NULL DEFAULT '{"view": false, "edit": false, "delete": false}',
  analytics JSONB NOT NULL DEFAULT '{"view": false, "edit": false, "delete": false}',
  user_management JSONB NOT NULL DEFAULT '{"view": false, "edit": false, "delete": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access" ON public.user_permissions;
CREATE POLICY "Public access"
ON public.user_permissions FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin users can update permissions" ON public.user_permissions;
CREATE POLICY "Admin users can update permissions"
ON public.user_permissions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

alter publication supabase_realtime add table user_permissions;
