import React from 'react';
import { X, FileText, Ship, Package2, BadgeCheck, AlertTriangle } from 'lucide-react';
import { Contract } from '../../../common/types/contract';
import { Shipment } from '../../../common/types/shipment';
import { shipmentStore } from '../../../common/stores/shipmentStore';
import Button from '../../../common/components/Button/Button';
import StatusBadge from '../../../common/components/StatusBadge/StatusBadge';

interface ContractDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  shipments: Shipment[];
  onRouteShipment?: (shipment: Shipment) => void;
  onUnrouteShipment?: (shipment: Shipment) => void;
}

export default function ContractDetailsDialog({
  isOpen,
  onClose,
  contract,
  shipments,
  onRouteShipment,
  onUnrouteShipment
}: ContractDetailsDialogProps) {
  if (!isOpen) return null;

  // Calculate quantities
  const totalQuantity = Number(contract.quantity);
  const routedQuantity = contract.type === 'Sales' 
    ? shipmentStore.getRoutedQuantity(contract.id)
    : shipments.reduce((sum, s) => sum + s.quantity, 0);
  const remainingQuantity = totalQuantity - routedQuantity;
  const routedPercentage = (routedQuantity / totalQuantity) * 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  contract.type === 'Supply' ? 'bg-green-50' : 'bg-blue-50'
                }`}>
                  <FileText className={`w-5 h-5 ${
                    contract.type === 'Supply' ? 'text-green-600' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{contract.id}</h3>
                  <p className="text-sm text-gray-500">{contract.type} Contract</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Contract Details */}
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Product</div>
                  <div className="inline-flex items-center px-2 py-1 mt-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    <Package2 className="w-3.5 h-3.5 mr-1.5" />
                    {contract.productType}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Terms</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">{contract.incoterm}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Price</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {contract.currency} {contract.unitPrice}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">
                    {contract.type === 'Supply' ? 'Fulfilled' : 'Routed'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {routedQuantity.toLocaleString()} MT of {totalQuantity.toLocaleString()} MT ({routedPercentage.toFixed(1)}%)
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
                <div className="mt-1 text-xs text-gray-500">
                  {remainingQuantity.toLocaleString()} MT remaining
                </div>
              </div>
            </div>

            {/* Shipments List */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                {contract.type === 'Supply' ? 'Contract Shipments' : 'Routed Shipments'}
              </h4>
              <div className="space-y-3">
                {shipments.length === 0 ? (
                  <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-center">
                      <Ship className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No shipments found</p>
                    </div>
                  </div>
                ) : (
                  shipments.map(shipment => (
                    <div
                      key={shipment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <Ship className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{shipment.id}</span>
                            <StatusBadge status={shipment.status} size="sm" />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {shipment.quantity.toLocaleString()} MT • {shipment.terminal}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {contract.type === 'Supply' ? (
                          shipment.routingDetails ? (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                <BadgeCheck className="w-3.5 h-3.5" />
                                <div>
                                  <div>Routed</div>
                                  <div className="text-[10px] text-green-600">
                                    to {shipment.routingDetails.routedToContractId}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                onClick={() => onUnrouteShipment?.(shipment)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Unroute
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="secondary"
                              onClick={() => onRouteShipment?.(shipment)}
                              className="text-indigo-600 hover:text-indigo-700"
                            >
                              Route
                            </Button>
                          )
                        ) : (
                          <Button
                            variant="ghost"
                            onClick={() => onUnrouteShipment?.(shipment)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Unroute
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}