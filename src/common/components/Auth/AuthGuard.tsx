import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useSupabaseAuthStore from "../../stores/supabaseAuthStore";
import LoadingScreen from "./LoadingScreen";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useSupabaseAuthStore();
  const location = useLocation();

  if (isLoading || !isInitialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
