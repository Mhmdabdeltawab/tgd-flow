import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  "https://dkeshrwqguoxfuzzecto.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
  // Provide fallback for development
  console.warn("Using fallback Supabase configuration for development");
}

// Add more detailed logging for connection issues
console.log("Initializing Supabase client with URL:", supabaseUrl);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Log connection status
supabase.auth.onAuthStateChange((event, session) => {
  console.log(
    "Supabase auth event:",
    event,
    session ? "User authenticated" : "No session",
  );
});
