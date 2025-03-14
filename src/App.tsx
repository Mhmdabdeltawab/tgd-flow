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
import { ErrorBoundary } from "./common/components/ErrorBoundary/ErrorBoundary";
import ToastContainer from "./common/components/Toast/ToastContainer";
import routes from "tempo-routes";

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/routing" element={<RoutingPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/contracts/new" element={<ContractForm />} />
            <Route path="/contracts/edit/:id" element={<ContractForm />} />
            <Route path="/shipments" element={<ShipmentsPage />} />
            <Route path="/shipments/new" element={<NewShipmentForm />} />
            <Route path="/shipments/edit/:id" element={<EditShipmentForm />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/suppliers/new" element={<SupplierForm />} />
            <Route path="/suppliers/edit/:id" element={<SupplierForm />} />
            <Route path="/tanks" element={<TanksPage />} />
            <Route path="/tanks/new" element={<TankForm />} />
            <Route path="/tanks/edit/:id" element={<TankForm />} />
            <Route path="/buyers" element={<BuyersPage />} />
            <Route path="/buyers/new" element={<BuyerForm />} />
            <Route path="/buyers/edit/:id" element={<BuyerForm />} />
            <Route path="/warehouses" element={<WarehousesPage />} />
            <Route path="/warehouses/new" element={<WarehouseForm />} />
            <Route path="/warehouses/edit/:id" element={<WarehouseForm />} />
            <Route path="/terminals" element={<TerminalsPage />} />
            <Route path="/terminals/new" element={<TerminalForm />} />
            <Route path="/terminals/edit/:id" element={<TerminalForm />} />
            <Route path="/storage-tanks" element={<StorageTanksPage />} />
            <Route path="/storage-tanks/new" element={<StorageTankForm />} />
            <Route
              path="/storage-tanks/edit/:id"
              element={<StorageTankForm />}
            />

            {/* Allow Tempo to capture routes before any catchall */}
            {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
          </Routes>
          {/* Tempo routes - only included in development when VITE_TEMPO is true */}
          {import.meta.env.VITE_TEMPO && useRoutes(routes)}
        </Layout>
        <ToastContainer />
      </Router>
    </ErrorBoundary>
  );
};

export default App;
