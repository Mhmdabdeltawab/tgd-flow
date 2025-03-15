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
        const { data, error } = await supabase.rpc("pgrest", {
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

        if (error) {
          console.error("Error checking RLS status:", error);
          setStatus({
            isEnabled: false,
            tables: [],
            loading: false,
            error: error.message,
          });
          return;
        }

        // Process the data
        const tables = data.map((row: any) => ({
          name: row.table_name,
          hasRls: row.has_rls,
          policies: row.policies,
        }));

        // Check if users table has RLS enabled
        const usersTable = tables.find((t: any) => t.name === "users");
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
          error: error.message,
        });
      }
    };

    checkRlsStatus();
  }, []);

  return status;
};
