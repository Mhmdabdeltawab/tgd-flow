import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

interface RlsStatus {
  isEnabled: boolean;
  tables: {
    name: string;
    hasRls: boolean;
    policies: string[];
  }[];
  loading: boolean;
  error: string | null;
}

export const useRlsStatus = () => {
  const [status, setStatus] = useState<RlsStatus>({
    isEnabled: false,
    tables: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkRlsStatus = async () => {
      try {
        console.log("Checking RLS status...");

        // First, check if the pgrest function exists
        const { data: functionExists, error: functionCheckError } =
          await supabase
            .from("pg_proc")
            .select("proname")
            .eq("proname", "pgrest")
            .maybeSingle();

        if (functionCheckError) {
          console.error(
            "Error checking if pgrest function exists:",
            functionCheckError,
          );
          setStatus({
            isEnabled: false,
            tables: [],
            loading: false,
            error: `Error checking if pgrest function exists: ${functionCheckError.message}`,
          });
          return;
        }

        if (!functionExists) {
          console.error("pgrest function does not exist");
          setStatus({
            isEnabled: false,
            tables: [],
            loading: false,
            error:
              "pgrest function does not exist. Please run the latest migration.",
          });
          return;
        }

        // Now try to use the pgrest function
        const { data: result, error: rpcError } = await supabase.rpc("pgrest", {
          query: `
            WITH table_rls AS (
              SELECT 
                n.nspname AS schema_name,
                c.relname AS table_name,
                CASE WHEN c.relrowsecurity THEN true ELSE false END AS has_rls
              FROM pg_class c
              JOIN pg_namespace n ON n.oid = c.relnamespace
              WHERE n.nspname = 'public'
              AND c.relkind = 'r'
            ),
            policies AS (
              SELECT 
                schemaname,
                tablename,
                array_agg(policyname) as policies
              FROM pg_policies
              WHERE schemaname = 'public'
              GROUP BY schemaname, tablename
            )
            SELECT 
              t.table_name,
              t.has_rls,
              COALESCE(p.policies, ARRAY[]::text[]) as policies
            FROM table_rls t
            LEFT JOIN policies p ON t.table_name = p.tablename AND t.schema_name = p.schemaname
            ORDER BY t.table_name;
          `,
        });

        if (rpcError) {
          console.error("RPC error checking RLS status:", rpcError);
          setStatus({
            isEnabled: false,
            tables: [],
            loading: false,
            error: `RPC error: ${rpcError.message}`,
          });
          return;
        }

        if (result && result.error) {
          console.error("pgrest function returned an error:", result.error);
          setStatus({
            isEnabled: false,
            tables: [],
            loading: false,
            error: `pgrest error: ${result.error}`,
          });
          return;
        }

        // Success case - result should be a JSON array
        console.log("RLS status result:", result);

        if (!Array.isArray(result)) {
          console.error("Unexpected result format:", result);
          setStatus({
            isEnabled: false,
            tables: [],
            loading: false,
            error: `Unexpected result format: ${JSON.stringify(result)}`,
          });
          return;
        }

        // Process the data
        const tables = result.map((row) => ({
          name: row.table_name,
          hasRls: row.has_rls,
          policies: row.policies || [],
        }));

        // Check if users table has RLS enabled
        const usersTable = tables.find((t) => t.name === "users");
        const userPermissionsTable = tables.find(
          (t) => t.name === "user_permissions",
        );

        console.log("Users table:", usersTable);
        console.log("User permissions table:", userPermissionsTable);

        const isEnabled = usersTable ? usersTable.hasRls : false;

        setStatus({
          isEnabled,
          tables,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        console.error("Error in checkRlsStatus:", error);
        setStatus({
          isEnabled: false,
          tables: [],
          loading: false,
          error: `Unexpected error: ${error.message}`,
        });
      }
    };

    checkRlsStatus();
  }, []);

  return status;
};
