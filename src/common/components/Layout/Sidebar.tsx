import React from "react";
import {
  LayoutDashboard,
  Box,
  Navigation2,
  Ship,
  PieChart,
  Sun,
  FileText,
  Warehouse,
  Building2,
  Factory,
  Building,
  CircleDollarSign,
  Container,
  Users2,
  LogOut,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import usePermissions from "../../hooks/usePermissions";

const NavItem = ({
  to,
  icon: Icon,
  label,
  isActive,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-2 text-sm ${
      isActive
        ? "bg-indigo-50 text-indigo-600"
        : "text-gray-700 hover:bg-gray-50"
    }`}
  >
    <Icon className="w-5 h-5 mr-3" />
    {label}
  </Link>
);

const NavSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  // Only render section if it has visible children
  const childrenArray = React.Children.toArray(children);
  if (childrenArray.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </div>
      <nav className="mt-2 space-y-1">{children}</nav>
    </div>
  );
};

export default function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const { canView, isAdmin } = usePermissions();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Box className="w-6 h-6 text-indigo-600 mr-2" />
          <span className="text-lg font-semibold text-gray-900">Tagaddod</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">FLOW</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="mt-2 space-y-1 px-2">
          {canView("dashboard") && (
            <NavItem
              to="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              isActive={isActive("/dashboard")}
            />
          )}
        </nav>

        <NavSection title="COMMERCIAL">
          {canView("contracts") && (
            <NavItem
              to="/contracts"
              icon={FileText}
              label="Contracts"
              isActive={isActive("/contracts")}
            />
          )}
          {canView("routing") && (
            <NavItem
              to="/routing"
              icon={Navigation2}
              label="Routing"
              isActive={isActive("/routing")}
            />
          )}
        </NavSection>

        <NavSection title="INVENTORY & STORAGE">
          {canView("warehouses") && (
            <NavItem
              to="/warehouses"
              icon={Building}
              label="Warehouses"
              isActive={isActive("/warehouses")}
            />
          )}
          {canView("terminals") && (
            <NavItem
              to="/terminals"
              icon={Warehouse}
              label="Terminals"
              isActive={isActive("/terminals")}
            />
          )}
          {canView("storageTanks") && (
            <NavItem
              to="/storage-tanks"
              icon={Container}
              label="Storage Tanks"
              isActive={isActive("/storage-tanks")}
            />
          )}
        </NavSection>

        <NavSection title="LOGISTICS">
          {canView("shipments") && (
            <NavItem
              to="/shipments"
              icon={Ship}
              label="Shipments"
              isActive={isActive("/shipments")}
            />
          )}
          {canView("tanks") && (
            <NavItem
              to="/tanks"
              icon={Container}
              label="Tanks"
              isActive={isActive("/tanks")}
            />
          )}
        </NavSection>

        <NavSection title="DATABASE">
          {canView("suppliers") && (
            <NavItem
              to="/suppliers"
              icon={Building2}
              label="Suppliers"
              isActive={isActive("/suppliers")}
            />
          )}
          {canView("buyers") && (
            <NavItem
              to="/buyers"
              icon={CircleDollarSign}
              label="Buyers"
              isActive={isActive("/buyers")}
            />
          )}
        </NavSection>

        <NavSection title="REPORTS">
          {canView("analytics") && (
            <NavItem
              to="/analytics"
              icon={PieChart}
              label="Analytics"
              isActive={isActive("/analytics")}
            />
          )}
        </NavSection>

        <NavSection title="SETTINGS">
          {canView("userManagement") && (
            <NavItem
              to="/user-management"
              icon={Users2}
              label="User Management"
              isActive={isActive("/user-management")}
            />
          )}
        </NavSection>
      </div>

      <div className="p-4 border-t border-gray-200 space-y-2">
        {user && (
          <div className="flex items-center mb-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name}
                className="w-8 h-8 rounded-full mr-2"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                <span className="text-indigo-600 font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          className="flex items-center w-full text-sm text-gray-600 hover:text-gray-900 py-2"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
