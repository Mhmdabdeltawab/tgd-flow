import React from 'react';
import { X, FileText, AlertTriangle, BadgeCheck, ArrowRight } from 'lucide-react';
import Button from '../Button/Button';
import { contractsStore } from '../../stores/contractsStore';
import { shipmentStore } from '../../stores/shipmentStore';

interface RouteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  onRoute: (salesContractId: string) => void;
}

export default function RouteDialog({
  isOpen,
  onClose,
  shipmentId,
  onRoute
}: RouteDialogProps) {
  const [selectedContract, setSelectedContract] = React.useState<string>('');
  const [errors, setErrors] = React.useState<string[]>([]);
  const [warnings, setWarnings] = React.useState<string[]>([]);

  // Get shipment details
  const shipment = React.useMemo(() => {
    return shipmentStore.getById(shipmentId);
  }, [shipmentId]);

  // Get available sales contracts
  const availableContracts = React.useMemo(() => {
    if (!shipment) return [];
    
    return contractsStore.getAll().filter(contract => {
      // Only show sales contracts
      if (contract.type !== 'Sales') return false;
      
      // Only show open contracts
      if (contract.status !== 'opened') return false;
      
      // Must match product type
      if (contract.productType !== shipment.productType) return false;

      // Check remaining quantity
      const routedQuantity = shipmentStore.getRoutedQuantity(contract.id);
      const remainingQuantity = Number(contract.quantity) - routedQuantity;
      
      // Must have enough remaining quantity
      return remainingQuantity >= shipment.quantity;
    });
  }, [shipment]);

  // Handle contract selection
  const handleContractSelect = (contractId: string) => {
    setSelectedContract(contractId);
    
    // Validate routing
    const validation = shipmentStore.validateRouting(shipmentId, contractId);
    setErrors(validation.errors);
    setWarnings(validation.warnings);
  };

  // Handle routing confirmation
  const handleConfirm = () => {
    if (!selectedContract) return;
    onRoute(selectedContract);
  };

  if (!isOpen || !shipment) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Route Shipment</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Shipment Details */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Shipment Details</h4>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">ID</div>
                    <div className="font-medium text-gray-900">{shipment.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Product</div>
                    <div className="font-medium text-gray-900">{shipment.productType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Quantity</div>
                    <div className="font-medium text-gray-900">{shipment.quantity.toLocaleString()} MT</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="font-medium text-gray-900">{shipment.status}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Select Sales Contract</h4>
              {availableContracts.length === 0 ? (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <div>
                      <div className="font-medium">No available contracts</div>
                      <div className="text-sm">
                        No sales contracts found that match this shipment's product type and quantity requirements.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableContracts.map(contract => {
                    const routedQuantity = shipmentStore.getRoutedQuantity(contract.id);
                    const remainingQuantity = Number(contract.quantity) - routedQuantity;
                    
                    return (
                      <button
                        key={contract.id}
                        onClick={() => handleContractSelect(contract.id)}
                        className={`
                          w-full p-4 rounded-lg border-2 transition-colors duration-200 text-left
                          ${selectedContract === contract.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900">{contract.id}</span>
                          </div>
                          {selectedContract === contract.id && (
                            <BadgeCheck className="w-5 h-5 text-indigo-500" />
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Contract Quantity</div>
                            <div className="font-medium text-gray-900">
                              {Number(contract.quantity).toLocaleString()} MT
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Available Quantity</div>
                            <div className="font-medium text-gray-900">
                              {remainingQuantity.toLocaleString()} MT
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Validation Errors and Warnings */}
            {(errors.length > 0 || warnings.length > 0) && (
              <div className="mb-6">
                {errors.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-3">
                    <div className="flex items-start gap-2 text-red-700">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Validation Errors</div>
                        <ul className="mt-1 text-sm list-disc list-inside">
                          {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                {warnings.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-2 text-amber-700">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Quality Warnings</div>
                        <ul className="mt-1 text-sm list-disc list-inside">
                          {warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                        <p className="mt-2 text-sm">
                          You can proceed with routing despite these warnings, but please review the quality parameters carefully.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={ArrowRight}
                onClick={handleConfirm}
                disabled={!selectedContract || errors.length > 0}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Route Shipment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}