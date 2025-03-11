import React from 'react';
import { Container, Calendar } from 'lucide-react';
import FormField from './FormField';

interface TankDetailsProps {
  quantity: number;
  departureDate: string;
  arrivalDate: string;
  maxQuantity?: number;
  onQuantityChange: (value: number) => void;
  onDepartureDateChange: (value: string) => void;
  onArrivalDateChange: (value: string) => void;
  errors: {
    quantity?: string;
    departureDate?: string;
    arrivalDate?: string;
  };
}

export default function TankDetails({
  quantity,
  departureDate,
  arrivalDate,
  maxQuantity,
  onQuantityChange,
  onDepartureDateChange,
  onArrivalDateChange,
  errors
}: TankDetailsProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <>
      <FormField label="Quantity (MT)" error={errors.quantity} required>
        <div className="relative">
          <Container className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="number"
            value={isFocused ? quantity || '' : quantity || 0}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter quantity in metric tons"
            min="0"
            step="0.01"
            max={maxQuantity}
          />
        </div>
      </FormField>

      <div className="grid grid-cols-2 gap-6">
        <FormField label="Departure Date" error={errors.departureDate} required>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={departureDate}
              onChange={(e) => onDepartureDateChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </FormField>

        <FormField label="Arrival Date" error={errors.arrivalDate} required>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={arrivalDate}
              onChange={(e) => onArrivalDateChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min={departureDate}
            />
          </div>
        </FormField>
      </div>
    </>
  );
}