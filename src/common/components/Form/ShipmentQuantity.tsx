import React from 'react';
import { Ship } from 'lucide-react';
import FormField from './FormField';

interface ShipmentQuantityProps {
  quantity: number;
  maxQuantity?: number;
  onChange: (value: number) => void;
  error?: string;
  selectedContract?: {
    totalShippedQuantity: number;
    existingShipments: number;
    remainingQuantity: number;
  };
}

export default function ShipmentQuantity({
  quantity,
  maxQuantity,
  onChange,
  error,
  selectedContract
}: ShipmentQuantityProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <FormField label="Quantity (MT)" error={error} required>
      <div className="relative">
        <input
          type="number"
          value={isFocused ? quantity || '' : quantity || 0}
          onChange={(e) => onChange(Number(e.target.value))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter quantity in metric tons"
          min="0"
          step="0.01"
          max={maxQuantity}
        />
      </div>
      {selectedContract && (
        <div className="mt-2 text-sm text-gray-500">
          {selectedContract.totalShippedQuantity > 0 ? (
            <div className="flex items-center gap-2">
              <Ship className="w-4 h-4" />
              <span>
                {selectedContract.totalShippedQuantity.toLocaleString()} MT already shipped in {selectedContract.existingShipments} shipment{selectedContract.existingShipments !== 1 ? 's' : ''} •{' '}
                {selectedContract.remainingQuantity.toLocaleString()} MT remaining
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Ship className="w-4 h-4" />
              <span>No shipments created yet for this contract</span>
            </div>
          )}
        </div>
      )}
    </FormField>
  );
}