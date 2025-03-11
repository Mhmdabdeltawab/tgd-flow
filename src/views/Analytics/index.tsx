import React from 'react';
import PageHeader from '../../common/components/PageHeader/PageHeader';
import ContractInsights from './components/ContractInsights';
import LogisticsPerformance from './components/LogisticsPerformance';
import ComplianceOverview from './components/ComplianceOverview';
import { contractsStore } from '../../common/stores/contractsStore';
import { shipmentStore } from '../../common/stores/shipmentStore';
import { partyStore } from '../../common/stores/partyStore';
import { inventoryStore } from '../../common/stores/inventoryStore';
import { tankStore } from '../../common/stores/tankStore';
import { documentStore } from '../../common/stores/documentStore';

export default function AnalyticsPage() {
  // Get all data
  const contracts = React.useMemo(() => contractsStore.getAll(), []);
  const shipments = React.useMemo(() => shipmentStore.getAll(), []);
  const suppliers = React.useMemo(() => partyStore.getAll('suppliers'), []);
  const buyers = React.useMemo(() => partyStore.getAll('buyers'), []);
  const terminals = React.useMemo(() => inventoryStore.getAllTerminals(), []);
  const storageTanks = React.useMemo(() => inventoryStore.getAllStorageTanks(), []);
  const warehouses = React.useMemo(() => inventoryStore.getAllWarehouses(), []);
  const tanks = React.useMemo(() => tankStore.getAll(), []);
  const documents = React.useMemo(() => {
    return shipments.reduce((acc, shipment) => {
      acc[shipment.id] = documentStore.getByEntityId(shipment.id);
      return acc;
    }, {} as Record<string, Document[]>);
  }, [shipments]);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Business performance and operational insights"
      />

      <div className="p-6 space-y-6">
        <ContractInsights contracts={contracts} />
        <LogisticsPerformance 
          shipments={shipments}
          tanks={tanks}
          storageTanks={storageTanks}
          warehouses={warehouses}
        />
        <ComplianceOverview 
          shipments={shipments}
          suppliers={suppliers}
          buyers={buyers}
          documents={documents}
        />
      </div>
    </div>
  );
}