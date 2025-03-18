-- Create RPC functions to bypass RLS for user permissions operations

-- Function to insert user permissions
CREATE OR REPLACE FUNCTION insert_user_permissions(permissions_data JSONB)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_permissions (
    user_id,
    dashboard,
    contracts,
    routing,
    shipments,
    suppliers,
    tanks,
    buyers,
    warehouses,
    terminals,
    storage_tanks,
    analytics,
    user_management,
    created_at,
    updated_at
  ) VALUES (
    permissions_data->>'user_id',
    permissions_data->'dashboard',
    permissions_data->'contracts',
    permissions_data->'routing',
    permissions_data->'shipments',
    permissions_data->'suppliers',
    permissions_data->'tanks',
    permissions_data->'buyers',
    permissions_data->'warehouses',
    permissions_data->'terminals',
    permissions_data->'storage_tanks',
    permissions_data->'analytics',
    permissions_data->'user_management',
    COALESCE((permissions_data->>'created_at')::timestamp, NOW()),
    COALESCE((permissions_data->>'updated_at')::timestamp, NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user permissions
CREATE OR REPLACE FUNCTION update_user_permissions(user_id UUID, permissions_data JSONB)
RETURNS VOID AS $$
BEGIN
  UPDATE user_permissions
  SET
    dashboard = permissions_data->'dashboard',
    contracts = permissions_data->'contracts',
    routing = permissions_data->'routing',
    shipments = permissions_data->'shipments',
    suppliers = permissions_data->'suppliers',
    tanks = permissions_data->'tanks',
    buyers = permissions_data->'buyers',
    warehouses = permissions_data->'warehouses',
    terminals = permissions_data->'terminals',
    storage_tanks = permissions_data->'storage_tanks',
    analytics = permissions_data->'analytics',
    user_management = permissions_data->'user_management',
    updated_at = COALESCE((permissions_data->>'updated_at')::timestamp, NOW())
  WHERE user_id = update_user_permissions.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION insert_user_permissions(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_permissions(UUID, JSONB) TO authenticated;
