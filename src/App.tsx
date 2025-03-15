import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useRoutes,
} from "react-router-dom";
import Layout from "./common/components/Layout/Layout";
import DashboardPage from "./views/Dashboard";
import AnalyticsPage from "./views/Analytics";
import RoutingPage from "./views/Routing";
import ContractsPage from "./views/Contracts";
import ContractForm from "./views/Contracts/ContractForm";
import ShipmentsPage from "./views/Shipments";
import NewShipmentForm from "./views/Shipments/NewShipmentForm";
import EditShipmentForm from "./views/Shipments/EditShipmentForm";
import SuppliersPage from "./views/Suppliers";
import SupplierForm from "./views/Suppliers/SupplierForm";
import TerminalsPage from "./views/Terminals";
import TerminalForm from "./views/Terminals/TerminalForm";
import StorageTanksPage from "./views/StorageTanks";
import StorageTankForm from "./views/StorageTanks/StorageTankForm";
import WarehousesPage from "./views/Warehouses";
import WarehouseForm from "./views/Warehouses/WarehouseForm";
import TanksPage from "./views/Tanks";
import TankForm from "./views/Tanks/TankForm";
import BuyersPage from "./views/Buyers";
import BuyerForm from "./views/Buyers/BuyerForm";
import UserManagement from "./views/UserManagement";
import UserForm from "./views/UserManagement/UserForm";
import EditUserForm from "./views/UserManagement/EditUserForm";
import { ErrorBoundary } from "./common/components/ErrorBoundary/ErrorBoundary";
import ToastContainer from "./common/components/Toast/ToastContainer";
import routes from "tempo-routes";
import LoginPage from "./common/components/Auth/LoginPage";
import AuthGuard from "./common/components/Auth/AuthGuard";
import AuthCallback from "./common/components/Auth/AuthCallback";
import usePermissions from "./common/hooks/usePermissions";
import useSupabaseAuthStore from "./common/stores/supabaseAuthStore";

// Create a component for Tempo routes to ensure useRoutes is used within Router context
const TempoRoutes = () => {
  return import.meta.env.VITE_TEMPO ? useRoutes(routes) : null;
};

// Protected route component
const ProtectedRoute = ({
  element,
  requiredPermission,
}: {
  element: JSX.Element;
  requiredPermission?: keyof ReturnType<typeof usePermissions>["canView"];
}) => {
  const { canView } = usePermissions();
  const { isAuthenticated, isInitialized } = useSupabaseAuthStore();

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no specific permission is required, just check if user is authenticated
  if (!requiredPermission) {
    return <AuthGuard>{element}</AuthGuard>;
  }

  // Check if user has the required permission
  if (!canView(requiredPermission as any)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthGuard>{element}</AuthGuard>;
};

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <DashboardPage />
                  </Layout>
                }
                requiredPermission="dashboard"
              />
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <AnalyticsPage />
                  </Layout>
                }
                requiredPermission="analytics"
              />
            }
          />

          <Route
            path="/routing"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <RoutingPage />
                  </Layout>
                }
                requiredPermission="routing"
              />
            }
          />

          <Route
            path="/contracts"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <ContractsPage />
                  </Layout>
                }
                requiredPermission="contracts"
              />
            }
          />
          <Route
            path="/contracts/new"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <ContractForm />
                  </Layout>
                }
                requiredPermission="contracts"
              />
            }
          />
          <Route
            path="/contracts/edit/:id"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <ContractForm />
                  </Layout>
                }
                requiredPermission="contracts"
              />
            }
          />

          <Route
            path="/shipments"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <ShipmentsPage />
                  </Layout>
                }
                requiredPermission="shipments"
              />
            }
          />
          <Route
            path="/shipments/new"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <NewShipmentForm />
                  </Layout>
                }
                requiredPermission="shipments"
              />
            }
          />
          <Route
            path="/shipments/edit/:id"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <EditShipmentForm />
                  </Layout>
                }
                requiredPermission="shipments"
              />
            }
          />

          <Route
            path="/suppliers"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <SuppliersPage />
                  </Layout>
                }
                requiredPermission="suppliers"
              />
            }
          />
          <Route
            path="/suppliers/new"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <SupplierForm />
                  </Layout>
                }
                requiredPermission="suppliers"
              />
            }
          />
          <Route
            path="/suppliers/edit/:id"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <SupplierForm />
                  </Layout>
                }
                requiredPermission="suppliers"
              />
            }
          />

          <Route
            path="/tanks"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <TanksPage />
                  </Layout>
                }
                requiredPermission="tanks"
              />
            }
          />
          <Route
            path="/tanks/new"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <TankForm />
                  </Layout>
                }
                requiredPermission="tanks"
              />
            }
          />
          <Route
            path="/tanks/edit/:id"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <TankForm />
                  </Layout>
                }
                requiredPermission="tanks"
              />
            }
          />

          <Route
            path="/buyers"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <BuyersPage />
                  </Layout>
                }
                requiredPermission="buyers"
              />
            }
          />
          <Route
            path="/buyers/new"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <BuyerForm />
                  </Layout>
                }
                requiredPermission="buyers"
              />
            }
          />
          <Route
            path="/buyers/edit/:id"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <BuyerForm />
                  </Layout>
                }
                requiredPermission="buyers"
              />
            }
          />

          <Route
            path="/warehouses"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <WarehousesPage />
                  </Layout>
                }
                requiredPermission="warehouses"
              />
            }
          />
          <Route
            path="/warehouses/new"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <WarehouseForm />
                  </Layout>
                }
                requiredPermission="warehouses"
              />
            }
          />
          <Route
            path="/warehouses/edit/:id"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <WarehouseForm />
                  </Layout>
                }
                requiredPermission="warehouses"
              />
            }
          />

          <Route
            path="/terminals"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <TerminalsPage />
                  </Layout>
                }
                requiredPermission="terminals"
              />
            }
          />
          <Route
            path="/terminals/new"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <TerminalForm />
                  </Layout>
                }
                requiredPermission="terminals"
              />
            }
          />
          <Route
            path="/terminals/edit/:id"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <TerminalForm />
                  </Layout>
                }
                requiredPermission="terminals"
              />
            }
          />

          <Route
            path="/storage-tanks"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <StorageTanksPage />
                  </Layout>
                }
                requiredPermission="storageTanks"
              />
            }
          />
          <Route
            path="/storage-tanks/new"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <StorageTankForm />
                  </Layout>
                }
                requiredPermission="storageTanks"
              />
            }
          />
          <Route
            path="/storage-tanks/edit/:id"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <StorageTankForm />
                  </Layout>
                }
                requiredPermission="storageTanks"
              />
            }
          />

          <Route
            path="/user-management"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <UserManagement />
                  </Layout>
                }
                requiredPermission="userManagement"
              />
            }
          />
          <Route
            path="/user-management/new"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <UserForm />
                  </Layout>
                }
                requiredPermission="userManagement"
              />
            }
          />
          <Route
            path="/user-management/edit/:id"
            element={
              <ProtectedRoute
                element={
                  <Layout>
                    <EditUserForm />
                  </Layout>
                }
                requiredPermission="userManagement"
              />
            }
          />

          {/* Tempo routes - only included in development when VITE_TEMPO is true */}
          {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Tempo routes component - must be outside of Routes but inside Router */}
        <TempoRoutes />

        <ToastContainer />
      </Router>
    </ErrorBoundary>
  );
};

export default App;
