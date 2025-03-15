-- First, delete the existing admin user if it exists
DELETE FROM public.users WHERE email = 'abdeltawab@tagaddod.com';

-- Add the super admin user with a proper UUID
INSERT INTO public.users (id, email, name, photo_url, role, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'abdeltawab@tagaddod.com', 'Abdeltawab', NULL, 'admin', NOW(), NOW());

-- Add admin permissions
INSERT INTO public.user_permissions (
  user_id, dashboard, contracts, routing, shipments, suppliers, tanks, buyers,
  warehouses, terminals, storage_tanks, analytics, user_management, created_at, updated_at
)
SELECT 
  id,
  '{"view": true, "edit": true, "delete": true}'::jsonb AS dashboard,
  '{"view": true, "edit": true, "delete": true}'::jsonb AS contracts,
  '{"view": true, "edit": true, "delete": true}'::jsonb AS routing,
  '{"view": true, "edit": true, "delete": true}'::jsonb AS shipments,
  '{"view": true, "edit": true, "delete": true}'::jsonb AS suppliers,
  '{"view": true, "edit": true, "delete": true}'::jsonb AS tanks,
  '{"view": true, "edit": true, "delete": true}'::jsonb AS buyers,
  '{"view": true, "edit": true, "delete": true}'::jsonb AS warehouses,
  '{"view": true, "edit": true, "delete": true}'::jsonb AS terminals,
  '{"view": true, "edit": true, "delete": true}'::jsonb AS storage_tanks,
  '{"view": true, "edit": true, "delete": true}'::jsonb AS analytics,
  '{"view": true, "edit": true, "delete": true}'::jsonb AS user_management,
  NOW() AS created_at,
  NOW() AS updated_at
FROM public.users
WHERE email = 'abdeltawab@tagaddod.com'
ON CONFLICT (user_id) DO NOTHING;