import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useSupabaseAuthStore from "../../stores/supabaseAuthStore";
import { Box } from "lucide-react";
import Button from "../Button/Button";
import LoadingScreen from "./LoadingScreen";

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, error, isLoading, isInitialized } =
    useSupabaseAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);

  // Get the return URL from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, isInitialized]);

  useEffect(() => {
    if (error) {
      setLoginError(error);
    }
  }, [error]);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await login();
    } catch (err) {
      setLoginError("Failed to login. Please try again.");
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Logging in..." />;
  }

  if (!isInitialized) {
    return <LoadingScreen message="Initializing..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12">
      {/* Logo outside the box */}
      <div className="mb-8 text-center">
        <img
          src="https://workable-application-form.s3.amazonaws.com/advanced/production/628e42a07d26824e577acaeb/5f10bc14-4560-9a50-ba27-92e897667df3"
          alt="Tagaddod Logo"
          className="h-32 w-auto mx-auto"
        />
      </div>

      {/* Login box */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="font-bold text-gray-900 text-4xl">FLOW</h1>
          <p className="mt-2 text-sm text-gray-600">
            Connect . Trade . Deliver
          </p>
        </div>

        {loginError && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
            {loginError}
          </div>
        )}

        <div className="mt-6">
          <Button
            variant="primary"
            onClick={handleLogin}
            className="w-full flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M16 9v-4l8 7-8 7v-4h-8v-6h8zm-16-7v20h14v-2h-12v-16h12v-2h-14z"
                  />
                </svg>
                Sign in to Application
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Text below the box */}
      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Only authorized users can access this application.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
