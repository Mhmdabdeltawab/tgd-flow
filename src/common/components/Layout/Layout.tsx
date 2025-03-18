import React from "react";
import Sidebar from "./Sidebar";
import { resetAllStores } from "../../utils/resetStores";
import { AlertTriangle } from "lucide-react";
import Button from "../Button/Button";
import useSupabaseAuthStore from "../../stores/supabaseAuthStore";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [showReset, setShowReset] = React.useState(false);

  const handleReset = () => {
    resetAllStores();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {showReset && (
          <div className="p-4 bg-amber-50 border-b border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-800">
                  Having issues with duplicate data? Click reset to clear and
                  reinitialize all data.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowReset(false)}
                  className="text-amber-700 border-amber-300 hover:bg-amber-100"
                >
                  Dismiss
                </Button>
                <Button
                  variant="primary"
                  onClick={handleReset}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Reset Data
                </Button>
              </div>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
