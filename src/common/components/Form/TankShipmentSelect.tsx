import React from 'react';
import { Container } from 'lucide-react';
import FormField from './FormField';
import { Shipment } from '../../types/shipment';

interface TankShipmentSelectProps {
  value: string;
  onChange: (shipmentId: string) => void;
  shipments: Shipment[];
  error?: string;
  selectedShipment: Shipment | null;
  getAllocatedQuantity: (shipmentId: string) => number;
  getRemainingQuantity: (shipment: Shipment | null) => number;
}

export default function TankShipmentSelect({
  value,
  onChange,
  shipments,
  error,
  selectedShipment,
  getAllocatedQuantity,
  getRemainingQuantity
}: TankShipmentSelectProps) {
  return (
    <FormField label="Shipment" error={error} required>
      <div className="relative">
        <Container className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select shipment</option>
          {shipments.map(shipment => (
            <option key={shipment.id} value={shipment.id}>
              {shipment.id} ({shipment.terminal})
            </option>
          ))}
        </select>
      </div>
      {selectedShipment && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Shipment Quantity</div>
              <div className="font-medium text-gray-900">
                {selectedShipment.quantity.toLocaleString()} MT
              </div>
            </div>
            <div>
              <div className="text-gray-500">Allocated</div>
              <div className="font-medium text-gray-900">
                {getAllocatedQuantity(selectedShipment.id).toLocaleString()} MT
              </div>
            </div>
            <div>
              <div className="text-gray-500">Remaining</div>
              <div className="font-medium text-gray-900">
                {getRemainingQuantity(selectedShipment).toLocaleString()} MT
              </div>
            </div>
          </div>
        </div>
      )}
    </FormField>
  );
}