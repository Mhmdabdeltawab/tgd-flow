import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

interface TableRlsInfo {
  name: string;
  hasRls: boolean;
  policies: string[];
}

interface RlsStatus {
  isEnabled: boolean;
  tables: TableRlsInfo[];
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
    const fetchRlsStatus = async () => {
      try {
        const { data, error } = await supabase.rpc("get_rls_status");

        if (error) {
          console.error("Error fetching RLS status:", error);
          setStatus({
            isEnabled: false,
            tables: [],
            loading: false,
            error: `Error fetching RLS status: ${error.message}`,
          });
          return;
        }

        if (!Array.isArray(data)) {
          console.error("Unexpected result format:", data);
          setStatus({
            isEnabled: false,
            tables: [],
            loading: false,
            error: `Unexpected result format: ${JSON.stringify(data)}`,
          });
          return;
        }

        // Map the data to our interface
        const tables: TableRlsInfo[] = data.map((row) => ({
          name: row.table_name,
          hasRls: row.has_rls,
          policies: row.policies || [],
        }));

        // Check if users table has RLS enabled to determine overall status
        const usersTable = tables.find((t) => t.name === "users");
        const isEnabled = usersTable?.hasRls || false;

        setStatus({
          isEnabled,
          tables,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        console.error("Error in fetchRlsStatus:", error);
        setStatus({
          isEnabled: false,
          tables: [],
          loading: false,
          error: `Unexpected error: ${error.message}`,
        });
      }
    };

    fetchRlsStatus();
  }, []);

  return status;
};
