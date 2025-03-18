import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PartyList from "../Parties/PartyList";
import useSupabasePartyStore from "../../common/stores/supabasePartyStore";
import { supabase } from "../../common/services/supabaseClient";

export default function BuyersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabasePartyStore = useSupabasePartyStore();

  // Check if the parties table exists and has data
  useEffect(() => {
    const checkPartiesTable = async () => {
      try {
        console.log("BuyersPage: Checking parties table...");
        const { count, error } = await supabase
          .from("parties")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error checking parties table:", error);
          setError(
            "Error connecting to database. Please check your connection.",
          );
          return;
        }

        console.log(`BuyersPage: Found ${count} parties in database`);

        // Trigger a data update event to refresh the PartyList
        window.dispatchEvent(new Event("supabase-data-updated"));
      } catch (err) {
        console.error("Error checking parties table:", err);
        setError("Error connecting to database. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    checkPartiesTable();
  }, []);

  return (
    <>
      {error && (
        <div className="p-4 m-4 border border-red-300 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <PartyList type="buyers" />
    </>
  );
}
