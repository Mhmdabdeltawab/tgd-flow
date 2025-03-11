import React from 'react';
import PageHeader from '../../common/components/PageHeader/PageHeader';
import SupplyPanel from './components/SupplyPanel';
import DemandPanel from './components/DemandPanel';
import { contractsStore } from '../../common/stores/contractsStore';
import { shipmentStore } from '../../common/stores/shipmentStore';

export default function RoutingPage() {
  // Use state to track contracts and shipments
  const [contracts, setContracts] = React.useState(() => contractsStore.getAll());
  const [shipments, setShipments] = React.useState(() => shipmentStore.getAll());

  // Refresh data when localStorage changes
  React.useEffect(() => {
    const handleStorageChange = () => {
      setContracts(contractsStore.getAll());
      setShipments(shipmentStore.getAll());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Split contracts by type
  const supplyContracts = contracts.filter(c => c.type === 'Supply');
  const salesContracts = contracts.filter(c => c.type === 'Sales');

  return (
    <div>
      <PageHeader
        title="Routing"
        description="Manage supply and demand routing"
      />

      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Supply Panel */}
          <SupplyPanel 
            contracts={supplyContracts}
            shipments={shipments}
            setShipments={setShipments}
          />

          {/* Demand Panel */}
          <DemandPanel 
            contracts={salesContracts}
            shipments={shipments}
            setShipments={setShipments}
          />
        </div>
      </div>
    </div>
  );
}