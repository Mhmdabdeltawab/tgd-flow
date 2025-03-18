-- Add test parties data if none exists
INSERT INTO parties (id, type, name, email, phone, website, address, country, countryCode, accountManager, isccNumber, isccExpiry, created_at, updated_at)
SELECT 
  gen_random_uuid(), 'suppliers', 'Test Supplier 1', 'supplier1@example.com', '+1234567890', 'https://supplier1.com', '123 Supplier St', 'Malaysia', 'MY', 'John Manager', 'ISCC-S1-123456', '2025-12-31', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM parties WHERE type = 'suppliers' LIMIT 1);

INSERT INTO parties (id, type, name, email, phone, website, address, country, countryCode, accountManager, isccNumber, isccExpiry, created_at, updated_at)
SELECT 
  gen_random_uuid(), 'suppliers', 'Test Supplier 2', 'supplier2@example.com', '+2345678901', 'https://supplier2.com', '456 Supplier Ave', 'Indonesia', 'ID', 'Jane Manager', 'ISCC-S2-234567', '2025-10-15', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM parties WHERE type = 'suppliers' LIMIT 1);

INSERT INTO parties (id, type, name, email, phone, website, address, country, countryCode, accountManager, isccNumber, isccExpiry, created_at, updated_at)
SELECT 
  gen_random_uuid(), 'buyers', 'Test Buyer 1', 'buyer1@example.com', '+3456789012', 'https://buyer1.com', '789 Buyer Blvd', 'Singapore', 'SG', 'Alice Manager', 'ISCC-B1-345678', '2025-09-30', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM parties WHERE type = 'buyers' LIMIT 1);

INSERT INTO parties (id, type, name, email, phone, website, address, country, countryCode, accountManager, isccNumber, isccExpiry, created_at, updated_at)
SELECT 
  gen_random_uuid(), 'buyers', 'Test Buyer 2', 'buyer2@example.com', '+4567890123', 'https://buyer2.com', '012 Buyer Lane', 'Thailand', 'TH', 'Bob Manager', 'ISCC-B2-456789', '2025-08-15', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM parties WHERE type = 'buyers' LIMIT 1);
