import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Ship, Package2, ArrowRight, BadgeCheck, AlertTriangle } from 'lucide-react';
import { Contract } from '../../../common/types/contract';
import { Shipment } from '../../../common/types/shipment';
import { shipmentStore } from '../../../common/stores/shipmentStore';
import { useToast } from '../../../common/hooks/useToast';
import { useConfirm } from '../../../common/hooks/useConfirm';
import Button from '../../../common/components/Button/Button';
import ContractDetailsDialog from './ContractDetailsDialog';
import ConfirmDialog from '../../../common/components/ConfirmDialog/ConfirmDialog';

interface DemandPanelProps {
  contracts: Contract[];
  shipments: Shipment[];
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
}

export default function DemandPanel({ contracts, shipments, setShipments }: DemandPanelProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm, ConfirmDialog: confirmDialog } = useConfirm();
  const [selectedContract, setSelectedContract] = React.useState<Contract | null>(null);

  // Get routed shipments for a contract
  const getRoutedShipments = (contractId: string) => {
    return shipments.filter(s => s.routingDetails?.routedToContractId === contractId);
  };

  // Calculate routed quantity for a contract
  const getRoutedQuantity = (contractId: string) => {
    return shipmentStore.getRoutedQuantity(contractId);
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
        <h2 className="text-lg font-semibold text-gray-900">Demand</h2>
      </div>

      <div className="p-6 space-y-4">
        {contracts.map(contract => {
          const routedShipments = getRoutedShipments(contract.id);
          const routedQuantity = getRoutedQuantity(contract.id);
          const routedPercentage = (routedQuantity / Number(contract.quantity)) * 100;

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
                      <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <Package2 className="w-3.5 h-3.5 mr-1.5" />
                        {contract.productType}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500">Routed</span>
                      <span className="text-sm font-medium text-gray-900">
                        {routedQuantity.toLocaleString()} MT ({routedPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          routedPercentage === 100
                            ? 'bg-green-500'
                            : routedPercentage > 0
                              ? 'bg-blue-500'
                              : 'bg-gray-300'
                        }`}
                        style={{ width: `${routedPercentage}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-gray-600">
                            {routedShipments.length} shipments routed
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-500">
                        {(Number(contract.quantity) - routedQuantity).toLocaleString()} MT remaining
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedContract && (
        <ContractDetailsDialog
          isOpen={!!selectedContract}
          onClose={() => setSelectedContract(null)}
          contract={selectedContract}
          shipments={getRoutedShipments(selectedContract.id)}
          onUnrouteShipment={handleUnroute}
        />
      )}

      {confirmDialog && <ConfirmDialog {...confirmDialog} />}
    </div>
  );
}