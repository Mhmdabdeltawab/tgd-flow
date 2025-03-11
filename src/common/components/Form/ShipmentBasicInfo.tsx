import React from 'react';
import { FileText } from 'lucide-react';
import FormField from './FormField';
import StatusBadge from '../StatusBadge/StatusBadge';
import { Contract } from '../../types/contract';
import { ShipmentStatus, SHIPMENT_STATUSES } from '../../types/shipment';

interface ShipmentBasicInfoProps {
  contractId: string;
  status: ShipmentStatus;
  contracts: Contract[];
  onContractSelect: (contractId: string) => void;
  onStatusChange: (status: ShipmentStatus) => void;
  selectedContract: Contract | null;
  existingShipments?: {
    count: number;
    totalQuantity: number;
    remainingQuantity: number;
  };
  error?: {
    contractId?: string;
    status?: string;
  };
}

export default function ShipmentBasicInfo({
  contractId,
  status,
  contracts,
  onContractSelect,
  onStatusChange,
  selectedContract,
  existingShipments,
  error
}: ShipmentBasicInfoProps) {
  // Normalize contract ID to handle old/new formats
  const normalizedContractId = React.useMemo(() => {
    if (!contractId) return '';
    return contractId
      .replace('SUP-', 'SUPPLIER-')
      .replace('SEL-', 'SALES-')
      .replace('UCO-SUP-', 'UCO-SUPPLIER-')
      .replace('UCO-SEL-', 'UCO-SALES-');
  }, [contractId]);

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="col-span-2">
        <FormField label="Contract" error={error?.contractId} required>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={normalizedContractId}
              onChange={(e) => onContractSelect(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select contract</option>
              {contracts.map(contract => {
                const normalizedId = contract.id
                  .replace('SUP-', 'SUPPLIER-')
                  .replace('SEL-', 'SALES-')
                  .replace('UCO-SUP-', 'UCO-SUPPLIER-')
                  .replace('UCO-SEL-', 'UCO-SALES-');
                return (
                  <option key={normalizedId} value={normalizedId}>
                    {contract.id} - {contract.productType} ({contract.type})
                  </option>
                );
              })}
            </select>
          </div>
          {selectedContract && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Contract Quantity</div>
                  <div className="font-medium text-gray-900">
                    <div>{Number(selectedContract.quantity).toLocaleString()} MT</div>
                    {existingShipments && (
                      <div className="text-xs text-gray-500 mt-1">
                        {existingShipments.totalQuantity.toLocaleString()} MT shipped •{' '}
                        {existingShipments.remainingQuantity.toLocaleString()} MT remaining
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Product Type</div>
                  <div className="font-medium text-gray-900">
                    {selectedContract.productType}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Delivery Port</div>
                  <div className="font-medium text-gray-900">
                    {selectedContract.deliveryPort}
                  </div>
                </div>
              </div>
            </div>
          )}
        </FormField>
      </div>

      <div className="col-span-2 mt-6">
        <FormField label="Status" error={error?.status} required>
          <div className="flex gap-3">
            {SHIPMENT_STATUSES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => onStatusChange(s)}
                className={`
                  flex-1 flex items-center gap-2 justify-center
                  px-4 py-2 rounded-lg border-2 transition-all duration-200
                  ${status === s
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <StatusBadge status={s} size="sm" />
              </button>
            ))}
          </div>
        </FormField>
      </div>
    </div>
  );
}