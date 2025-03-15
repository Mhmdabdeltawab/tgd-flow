import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import useSupabaseAuthStore from "../../stores/supabaseAuthStore";
import LoadingScreen from "./LoadingScreen";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized } = useSupabaseAuthStore();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error in auth callback:", error);
        navigate("/login");
        return;
      }

      // If we have a session, the auth store will be updated by the auth state listener
      // Just wait for initialization to complete
      if (isInitialized) {
        navigate(isAuthenticated ? "/dashboard" : "/login");
      }
    };

    handleAuthCallback();
  }, [navigate, isAuthenticated, isInitialized]);

  return <LoadingScreen message="Completing authentication..." />;
};

export default AuthCallback;
