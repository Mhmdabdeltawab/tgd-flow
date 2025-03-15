-- Clear existing data
DELETE FROM public.documents;
DELETE FROM public.tanks;
DELETE FROM public.shipments;
DELETE FROM public.contracts;
DELETE FROM public.parties;

-- Create test parties (suppliers and buyers)
INSERT INTO public.parties (id, type, name, email, phone, address, country, city, contact_person, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'supplier', 'Green Palm Suppliers', 'contact@greenpalm.com', '+1-555-123-4567', '123 Palm Avenue', 'Malaysia', 'Kuala Lumpur', 'John Smith', NOW(), NOW()),
  (gen_random_uuid(), 'supplier', 'Eco Oils Inc.', 'sales@ecooils.com', '+1-555-987-6543', '456 Eco Street', 'Indonesia', 'Jakarta', 'Sarah Johnson', NOW(), NOW()),
  (gen_random_uuid(), 'buyer', 'Global Foods Corp', 'procurement@globalfoods.com', '+1-555-456-7890', '789 Global Road', 'United States', 'Chicago', 'Michael Brown', NOW(), NOW()),
  (gen_random_uuid(), 'buyer', 'Organic Products Ltd', 'orders@organicproducts.com', '+1-555-789-0123', '101 Organic Lane', 'United Kingdom', 'London', 'Emma Wilson', NOW(), NOW());

-- Get IDs for reference
DO $$
DECLARE
  supplier1_id UUID;
  supplier2_id UUID;
  buyer1_id UUID;
  buyer2_id UUID;
  contract1_id UUID;
  contract2_id UUID;
  contract3_id UUID;
  shipment1_id UUID;
  shipment2_id UUID;
  shipment3_id UUID;
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
  
  -- Get contract IDs
  SELECT id INTO contract1_id FROM contracts WHERE product_type = 'CPO' LIMIT 1;
  SELECT id INTO contract2_id FROM contracts WHERE product_type = 'RBDPO' LIMIT 1;
  SELECT id INTO contract3_id FROM contracts WHERE product_type = 'PKO' LIMIT 1;
  
  -- Create test shipments
  INSERT INTO public.shipments (id, contract_id, status, quantity, departure_date, arrival_date, origin_country, destination_country, destination_port, is_fulfilled, quality, created_at, updated_at)
  VALUES
    (gen_random_uuid(), contract1_id, 'In Transit', 1000, '2024-07-05', '2024-07-25', 'Malaysia', 'United States', 'Chicago', false, '{"FFA": 3.5, "IV": 53, "S": 0.15, "MI": 0.2}', NOW(), NOW()),
    (gen_random_uuid(), contract1_id, 'Scheduled', 1000, '2024-08-10', '2024-08-30', 'Malaysia', 'United States', 'Chicago', false, null, NOW(), NOW()),
    (gen_random_uuid(), contract2_id, 'Delivered', 2000, '2024-06-15', '2024-07-05', 'Indonesia', 'United Kingdom', 'London', true, '{"FFA": 3.1, "IV": 51, "S": 0.11, "MI": 0.17}', NOW(), NOW());
  
  -- Get shipment IDs
  SELECT id INTO shipment1_id FROM shipments WHERE status = 'In Transit' LIMIT 1;
  SELECT id INTO shipment2_id FROM shipments WHERE status = 'Scheduled' LIMIT 1;
  SELECT id INTO shipment3_id FROM shipments WHERE status = 'Delivered' LIMIT 1;
  
  -- Create test tanks
  INSERT INTO public.tanks (id, shipment_id, status, quantity, quality, departure_date, arrival_date, created_at, updated_at)
  VALUES
    (shipment1_id || '-TNK-001', shipment1_id, 'In Transit', 500, '{"FFA": 3.5, "IV": 53, "S": 0.15, "MI": 0.2}', '2024-07-05', '2024-07-25', NOW(), NOW()),
    (shipment1_id || '-TNK-002', shipment1_id, 'In Transit', 500, '{"FFA": 3.2, "IV": 52, "S": 0.12, "MI": 0.18}', '2024-07-05', '2024-07-25', NOW(), NOW()),
    (shipment2_id || '-TNK-001', shipment2_id, 'Loaded', 1000, '{"FFA": 3.8, "IV": 54, "S": 0.14, "MI": 0.22}', '2024-08-10', '2024-08-30', NOW(), NOW()),
    (shipment3_id || '-TNK-001', shipment3_id, 'Delivered', 1000, '{"FFA": 3.1, "IV": 51, "S": 0.11, "MI": 0.17}', '2024-06-15', '2024-07-05', NOW(), NOW()),
    (shipment3_id || '-TNK-002', shipment3_id, 'Delivered', 1000, '{"FFA": 3.3, "IV": 52, "S": 0.13, "MI": 0.19}', '2024-06-15', '2024-07-05', NOW(), NOW());
  
  -- Create test documents
  INSERT INTO public.documents (id, entity_type, entity_id, name, file_path, file_type, file_size, created_at)
  VALUES
    (gen_random_uuid(), 'contract', contract1_id, 'Contract Agreement', '/documents/contracts/agreement.pdf', 'application/pdf', 1024000, NOW()),
    (gen_random_uuid(), 'shipment', shipment1_id, 'Bill of Lading', '/documents/shipments/bill_of_lading.pdf', 'application/pdf', 512000, NOW()),
    (gen_random_uuid(), 'shipment', shipment1_id, 'Quality Certificate', '/documents/shipments/quality_cert.pdf', 'application/pdf', 256000, NOW()),
    (gen_random_uuid(), 'shipment', shipment3_id, 'Delivery Receipt', '/documents/shipments/delivery_receipt.pdf', 'application/pdf', 384000, NOW());

END $$;