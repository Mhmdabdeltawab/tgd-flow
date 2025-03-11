import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Ship, 
  Users2, 
  Building2, 
  Warehouse,
  Container,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  BadgeCheck,
  CircleDollarSign,
  BarChart3
} from 'lucide-react';
import { contractsStore } from '../../common/stores/contractsStore';
import { shipmentStore } from '../../common/stores/shipmentStore';
import { partyStore } from '../../common/stores/partyStore';
import { inventoryStore } from '../../common/stores/inventoryStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [contracts] = React.useState(() => contractsStore.getAll());
  const [shipments] = React.useState(() => shipmentStore.getAll());
  const [suppliers] = React.useState(() => partyStore.getAll('suppliers'));
  const [buyers] = React.useState(() => partyStore.getAll('buyers'));
  const [storageTanks] = React.useState(() => inventoryStore.getAllStorageTanks());
  const [terminals] = React.useState(() => inventoryStore.getAllTerminals());
  const [warehouses] = React.useState(() => inventoryStore.getAllWarehouses());

  // Calculate analytics
  const activeContracts = contracts.filter(c => c.status === 'opened');
  const totalSupply = contracts
    .filter(c => c.type === 'Supply')
    .reduce((sum, c) => sum + Number(c.quantity), 0);
  const totalDemand = contracts
    .filter(c => c.type === 'Sales')
    .reduce((sum, c) => sum + Number(c.quantity), 0);
  const supplyDemandGap = totalSupply - totalDemand;

  // Calculate storage utilization
  const totalStorageCapacity = terminals.reduce((sum, t) => sum + (t.capacity || 0), 0);
  const totalStorageUsed = storageTanks.reduce((sum, t) => sum + t.quantity, 0);
  const storageUtilization = totalStorageCapacity ? (totalStorageUsed / totalStorageCapacity) * 100 : 0;

  // Calculate active shipments
  const activeShipments = shipments.filter(s => s.status === 'in_transit');
  const pendingShipments = shipments.filter(s => s.status === 'scheduled');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600">Here's an overview of your business metrics.</p>
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Overview</h2>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Contracts Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">Contracts</span>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-semibold text-gray-900">{contracts.length}</div>
            <div className="text-sm text-gray-600">Total Contracts</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              {activeContracts.length} active contracts
            </div>
          </div>
        </div>

        {/* Supply Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">Supply</span>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-semibold text-gray-900">{totalSupply.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Supply (Tons)</div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <BadgeCheck className="w-4 h-4" />
              fulfilled
            </div>
          </div>
        </div>

        {/* Demand Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">Demand</span>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-semibold text-gray-900">{totalDemand.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Demand (Tons)</div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <AlertTriangle className="w-4 h-4" />
              routed
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <CircleDollarSign className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-600">Balance</span>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-semibold text-gray-900">{supplyDemandGap.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Supply-Demand Gap (Tons)</div>
            <div className="flex items-center gap-1 text-sm text-red-600">
              <TrendingDown className="w-4 h-4" />
              Deficit
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Quick Access</h2>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contracts Card */}
        <button
          onClick={() => navigate('/contracts')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:border-blue-500 transition-colors duration-200 group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Contracts</h3>
          <p className="text-gray-600 mb-6">
            Manage all your trading contracts, track status, and monitor performance
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-900">Active</div>
              <div className="text-2xl font-semibold text-blue-600">{activeContracts.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Total</div>
              <div className="text-2xl font-semibold text-gray-900">{contracts.length}</div>
            </div>
          </div>
        </button>

        {/* Suppliers Card */}
        <button
          onClick={() => navigate('/suppliers')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:border-green-500 transition-colors duration-200 group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-green-50 rounded-lg">
              <Users2 className="w-8 h-8 text-green-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Suppliers</h3>
          <p className="text-gray-600 mb-6">
            Access your supplier database, certifications, and contact details
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-900">Active</div>
              <div className="text-2xl font-semibold text-green-600">{suppliers.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Certified</div>
              <div className="text-2xl font-semibold text-gray-900">{suppliers.length}</div>
            </div>
          </div>
        </button>

        {/* Buyers Card */}
        <button
          onClick={() => navigate('/buyers')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:border-purple-500 transition-colors duration-200 group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Buyers</h3>
          <p className="text-gray-600 mb-6">
            View your buyer network, manage relationships, and track orders
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-900">Active</div>
              <div className="text-2xl font-semibold text-purple-600">{buyers.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Certified</div>
              <div className="text-2xl font-semibold text-gray-900">{buyers.length}</div>
            </div>
          </div>
        </button>

        {/* Shipments Card */}
        <button
          onClick={() => navigate('/shipments')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:border-amber-500 transition-colors duration-200 group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-amber-50 rounded-lg">
              <Ship className="w-8 h-8 text-amber-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Shipments</h3>
          <p className="text-gray-600 mb-6">
            Track active shipments, manage documentation, and monitor delivery status
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-900">In Transit</div>
              <div className="text-2xl font-semibold text-amber-600">
                {shipments.filter(s => s.status === 'in_transit').length}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Pending</div>
              <div className="text-2xl font-semibold text-gray-900">
                {shipments.filter(s => s.status === 'scheduled').length}
              </div>
            </div>
          </div>
        </button>

        {/* Storage Card */}
        <button
          onClick={() => navigate('/storage-tanks')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:border-indigo-500 transition-colors duration-200 group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Container className="w-8 h-8 text-indigo-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Storage</h3>
          <p className="text-gray-600 mb-6">
            Monitor storage capacity, tank allocation, and inventory levels
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-900">Utilization</div>
              <div className="text-2xl font-semibold text-indigo-600">
                {storageUtilization.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Tanks</div>
              <div className="text-2xl font-semibold text-gray-900">{storageTanks.length}</div>
            </div>
          </div>
        </button>

        {/* Terminals Card */}
        <button
          onClick={() => navigate('/terminals')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:border-cyan-500 transition-colors duration-200 group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-cyan-50 rounded-lg">
              <Warehouse className="w-8 h-8 text-cyan-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Terminals</h3>
          <p className="text-gray-600 mb-6">
            View terminal network, manage storage facilities, and track capacity
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-900">Terminals</div>
              <div className="text-2xl font-semibold text-cyan-600">{terminals.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Warehouses</div>
              <div className="text-2xl font-semibold text-gray-900">{warehouses.length}</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}