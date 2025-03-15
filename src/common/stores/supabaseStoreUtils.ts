import { supabase } from "../services/supabaseClient";

// Utility function to check if a table exists and has data
export const checkTableData = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error(`Error checking ${tableName} table:`, error);
      return false;
    }

    return count !== null && count > 0;
  } catch (error) {
    console.error(`Error in checkTableData for ${tableName}:`, error);
    return false;
  }
};

// Utility function to log detailed errors from Supabase
export const logSupabaseError = (operation: string, error: any) => {
  console.error(`Supabase error in ${operation}:`, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
};

// Utility function to handle Supabase responses
export const handleSupabaseResponse = <T>(
  data: T | null,
  error: any,
  operation: string,
): T | null => {
  if (error) {
    logSupabaseError(operation, error);
    return null;
  }
  return data;
};

// Utility function to ensure tables exist with basic data
export const ensureTablesExist = async () => {
  try {
    console.log("Checking database tables and permissions...");

    // Check if tables have data
    const hasUsers = await checkTableData("users");
    const hasParties = await checkTableData("parties");
    const hasContracts = await checkTableData("contracts");
    const hasShipments = await checkTableData("shipments");
    const hasTanks = await checkTableData("tanks");

    console.log("Table data check:", {
      hasUsers,
      hasParties,
      hasContracts,
      hasShipments,
      hasTanks,
    });

    // Run SQL to fix permissions and ensure tables exist
    const { error } = await supabase.rpc("pgrest", {
      query: `
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
      `,
    });

    if (error) {
      console.error("Error ensuring tables exist:", error);
    } else {
      console.log("Database setup completed successfully");
    }
  } catch (error) {
    console.error("Error in ensureTablesExist:", error);
  }
};

// Call this function when the app initializes
// We're no longer disabling RLS as we've set up proper policies
// ensureTablesExist();
