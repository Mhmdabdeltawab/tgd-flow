import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useSupabaseAuthStore from "../../stores/supabaseAuthStore";
import { Mail } from "lucide-react";
import Button from "../Button/Button";
import LoadingScreen from "./LoadingScreen";

const LoginPage: React.FC = () => {
  const { loginWithEmail, isAuthenticated, error, isLoading, isInitialized } =
    useSupabaseAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

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
    if (!email.trim()) {
      setLoginError("Please enter your email address");
      return;
    }

    if (!email.endsWith("@tagaddod.com")) {
      setLoginError("Only Tagaddod email addresses are allowed");
      return;
    }

    try {
      await loginWithEmail(email);
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

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@tagaddod.com"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

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
              <>Sign in to Application</>
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
