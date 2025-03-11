import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Ship, Package2, ArrowRight, BadgeCheck, AlertTriangle } from 'lucide-react';
import { Contract } from '../../../common/types/contract';
import { Shipment } from '../../../common/types/shipment';
import { shipmentStore } from '../../../common/stores/shipmentStore';
import { useToast } from '../../../common/hooks/useToast';
import { useConfirm } from '../../../common/hooks/useConfirm';
import Button from '../../../common/components/Button/Button';
import RouteDialog from '../../../common/components/RouteDialog/RouteDialog';
import ContractDetailsDialog from './ContractDetailsDialog';
import ConfirmDialog from '../../../common/components/ConfirmDialog/ConfirmDialog';

interface SupplyPanelProps {
  contracts: Contract[];
  shipments: Shipment[];
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
}

export default function SupplyPanel({ contracts, shipments, setShipments }: SupplyPanelProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm, ConfirmDialog: confirmDialog } = useConfirm();
  const [selectedShipment, setSelectedShipment] = React.useState<Shipment | null>(null);
  const [showRouteDialog, setShowRouteDialog] = React.useState(false);
  const [selectedContract, setSelectedContract] = React.useState<Contract | null>(null);
  const [viewMode, setViewMode] = React.useState<'contracts' | 'shipments'>('contracts');

  // Get shipments for a contract
  const getContractShipments = (contractId: string) => {
    return shipments.filter(s => s.contractId === contractId);
  };

  // Calculate fulfilled quantity for a contract
  const getFulfilledQuantity = (contractId: string) => {
    const contractShipments = getContractShipments(contractId);
    return contractShipments.reduce((sum, s) => sum + s.quantity, 0);
  };

  // Calculate routed quantity for a contract
  const getRoutedQuantity = (contractId: string) => {
    return shipmentStore.getRoutedQuantity(contractId);
  };

  // Handle routing
  const handleRoute = async (salesContractId: string) => {
    if (!selectedShipment) return;

    try {
      await shipmentStore.routeShipment(selectedShipment.id, salesContractId);
      // Force refresh of shipments data
      const updatedShipments = shipmentStore.getAll();
      setShipments(updatedShipments);
      toast.success('Shipment routed successfully');
      setShowRouteDialog(false);
      setSelectedShipment(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to route shipment');
    }
  };

  // Handle unrouting
  const handleUnroute = async (shipment: Shipment) => {
    const confirmed = await confirm({
      title: 'Remove Routing',
      message: 'Are you sure you want to remove this shipment\'s routing? This action cannot be undone.',
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
      isDanger: true
    });

    if (confirmed) {
      try {
        await shipmentStore.unrouteShipment(shipment.id);
        // Force refresh of shipments data
        const updatedShipments = shipmentStore.getAll();
        setShipments(updatedShipments);
        toast.success('Routing removed successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to remove routing');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Supply</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'contracts' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('contracts')}
              className="text-sm"
            >
              Contracts
            </Button>
            <Button
              variant={viewMode === 'shipments' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('shipments')}
              className="text-sm"
            >
              Shipments
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {viewMode === 'contracts' ? (
          // Contracts View
          contracts.map(contract => {
            const contractShipments = getContractShipments(contract.id);
            const fulfilledQuantity = getFulfilledQuantity(contract.id);
            const fulfilledPercentage = (fulfilledQuantity / Number(contract.quantity)) * 100;
            const remainingQuantity = Number(contract.quantity) - fulfilledQuantity;

            return (
              <div
                key={contract.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-indigo-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                onClick={() => setSelectedContract(contract)}
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">{contract.id}</div>
                      <div className="text-sm font-medium text-gray-900">
                        {Number(contract.quantity).toLocaleString()} MT
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Terms</div>
                        <div className="font-medium text-gray-900">{contract.incoterm}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Price</div>
                        <div className="font-medium text-gray-900">
                          {contract.currency} {contract.unitPrice}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Product</div>
                        <div className="inline-flex items-center px-2 py-1 mt-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <Package2 className="w-3.5 h-3.5 mr-1.5" />
                          {contract.productType}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-500">Fulfilled</span>
                        <span className="text-sm font-medium text-gray-900">
                          {fulfilledQuantity.toLocaleString()} MT ({fulfilledPercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            fulfilledPercentage === 100
                              ? 'bg-green-500'
                              : fulfilledPercentage > 0
                                ? 'bg-blue-500'
                                : 'bg-gray-300'
                          }`}
                          style={{ width: `${fulfilledPercentage}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <BadgeCheck className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-gray-600">
                              {contractShipments.filter(s => s.routingDetails).length} routed
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-gray-600">
                              {contractShipments.filter(s => !s.routingDetails).length} unrouted
                            </span>
                          </div>
                        </div>
                        <span className="text-gray-500">
                          {remainingQuantity.toLocaleString()} MT remaining
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Shipments View
          shipments
            .filter(s => s.type === 'Supply')
            .map(shipment => (
              <div
                key={shipment.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-indigo-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  if (!shipment.routingDetails) {
                    setSelectedShipment(shipment);
                    setShowRouteDialog(true);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <Ship className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">{shipment.id}</div>
                      <div className="text-sm font-medium text-gray-900">
                        {shipment.quantity.toLocaleString()} MT
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Product</div>
                        <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <Package2 className="w-3.5 h-3.5 mr-1.5" />
                          {shipment.productType}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Terminal</div>
                        <div className="font-medium text-gray-900">{shipment.terminal}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Status</div>
                        <div className="font-medium text-gray-900">{shipment.status}</div>
                      </div>
                    </div>

                    {shipment.routingDetails ? (
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700">Routed to {shipment.routingDetails.routedToContractId}</span>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnroute(shipment);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove Routing
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-amber-700">Not routed</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {selectedShipment && (
        <RouteDialog
          isOpen={showRouteDialog}
          onClose={() => {
            setShowRouteDialog(false);
            setSelectedShipment(null);
          }}
          shipmentId={selectedShipment.id}
          onRoute={handleRoute}
        />
      )}

      {selectedContract && (
        <ContractDetailsDialog
          isOpen={!!selectedContract}
          onClose={() => setSelectedContract(null)}
          contract={selectedContract}
          shipments={getContractShipments(selectedContract.id)}
          onRouteShipment={(shipment) => {
            setSelectedShipment(shipment);
            setShowRouteDialog(true);
            setSelectedContract(null);
          }}
          onUnrouteShipment={handleUnroute}
        />
      )}

      {confirmDialog && <ConfirmDialog {...confirmDialog} />}
    </div>
  );
}