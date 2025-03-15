-- Populate users table with test data
INSERT INTO public.users (id, email, name, photo_url, role, created_at, updated_at)
VALUES
  ('admin-user-123', 'abdeltawab@tagaddod.com', 'Abdeltawab', NULL, 'admin', NOW(), NOW()),
  (gen_random_uuid(), 'user1@tagaddod.com', 'User One', NULL, 'user', NOW(), NOW()),
  (gen_random_uuid(), 'user2@tagaddod.com', 'User Two', NULL, 'user', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Populate user_permissions table with test data
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

-- Populate parties table with test data
INSERT INTO public.parties (
  id, type, name, email, phone, website, address, country, city, postal_code, contact_person, notes, created_at, updated_at
)
VALUES
  (gen_random_uuid(), 'suppliers', 'Supplier A', 'suppliera@example.com', '+201234567890', 'https://suppliera.com', '123 Supplier St', 'Egypt', 'Cairo', '12345', 'Contact A', 'Test supplier', NOW(), NOW()),
  (gen_random_uuid(), 'suppliers', 'Supplier B', 'supplierb@example.com', '+201234567891', 'https://supplierb.com', '456 Supplier St', 'Egypt', 'Alexandria', '12346', 'Contact B', 'Another test supplier', NOW(), NOW()),
  (gen_random_uuid(), 'buyers', 'Buyer X', 'buyerx@example.com', '+201234567892', 'https://buyerx.com', '789 Buyer St', 'Saudi Arabia', 'Riyadh', '54321', 'Contact X', 'Test buyer', NOW(), NOW()),
  (gen_random_uuid(), 'buyers', 'Buyer Y', 'buyery@example.com', '+201234567893', 'https://buyery.com', '012 Buyer St', 'UAE', 'Dubai', '54322', 'Contact Y', 'Another test buyer', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Populate contracts table with test data
INSERT INTO public.contracts (
  id, type, status, buyer_id, seller_id, buyer_name, seller_name, product_type, incoterm, quantity,
  allowed_variance, unit_price, currency, payment_terms, quality_ffa, quality_iv, quality_s, quality_m1,
  packing_standard, origin_country, delivery_country, delivery_port, loading_start_date, loading_period,
  loading_duration, delivery_date, created_at, updated_at, created_by
)
SELECT
  gen_random_uuid() AS id,
  'Sales' AS type,
  'opened' AS status,
  b.id AS buyer_id,
  s.id AS seller_id,
  b.name AS buyer_name,
  s.name AS seller_name,
  'Palm Oil' AS product_type,
  'FOB' AS incoterm,
  '1000' AS quantity,
  '5%' AS allowed_variance,
  '1200' AS unit_price,
  'USD' AS currency,
  'Net 30' AS payment_terms,
  '0.5' AS quality_ffa,
  '50' AS quality_iv,
  '0.2' AS quality_s,
  '0.1' AS quality_m1,
  'ISO Standard' AS packing_standard,
  'Egypt' AS origin_country,
  'Saudi Arabia' AS delivery_country,
  'Jeddah' AS delivery_port,
  (NOW() + INTERVAL '10 days')::text AS loading_start_date,
  '15' AS loading_period,
  'week' AS loading_duration,
  (NOW() + INTERVAL '30 days')::text AS delivery_date,
  NOW() AS created_at,
  NOW() AS updated_at,
  'admin-user-123' AS created_by
FROM 
  (SELECT id, name FROM public.parties WHERE type = 'buyers' LIMIT 1) b,
  (SELECT id, name FROM public.parties WHERE type = 'suppliers' LIMIT 1) s
ON CONFLICT DO NOTHING;

-- Populate shipments table with test data
INSERT INTO public.shipments (
  id, contract_id, status, quantity, departure_date, arrival_date, origin_country,
  destination_country, destination_port, is_fulfilled, quality, created_at, updated_at, created_by
)
SELECT
  gen_random_uuid() AS id,
  id AS contract_id,
  'scheduled' AS status,
  500 AS quantity,
  (NOW() + INTERVAL '15 days')::text AS departure_date,
  (NOW() + INTERVAL '25 days')::text AS arrival_date,
  'Egypt' AS origin_country,
  'Saudi Arabia' AS destination_country,
  'Jeddah' AS destination_port,
  FALSE AS is_fulfilled,
  '{"FFA": 0.5, "IV": 50, "S": 0.2, "MI": 0.1}'::jsonb AS quality,
  NOW() AS created_at,
  NOW() AS updated_at,
  'admin-user-123' AS created_by
FROM public.contracts
LIMIT 1
ON CONFLICT DO NOTHING;

-- Populate tanks table with test data
INSERT INTO public.tanks (
  id, shipment_id, status, quantity, quality, departure_date, arrival_date, created_at, updated_at, created_by
)
SELECT
  shipment_id || '-TNK-001' AS id,
  shipment_id,
  'Loaded' AS status,
  250 AS quantity,
  '{"FFA": 0.5, "IV": 50, "S": 0.2, "MI": 0.1}'::jsonb AS quality,
  departure_date AS departure_date,
  arrival_date AS arrival_date,
  NOW() AS created_at,
  NOW() AS updated_at,
  'admin-user-123' AS created_by
FROM public.shipments
ON CONFLICT DO NOTHING;
