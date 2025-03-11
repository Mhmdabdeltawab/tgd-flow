import React from 'react';
import { Ship, Calendar } from 'lucide-react';
import FormField from './FormField';

interface Terminal {
  id: string;
  name: string;
  port: string;
  country: string;
}

interface ShippingLine {
  id: string;
  name: string;
}

interface ShipmentLogisticsProps {
  terminal: string;
  port: string;
  country: string;
  shippingLine: string;
  departureDate: string;
  terminals: Terminal[];
  shippingLines: ShippingLine[];
  arrivalDate: string;
  onTerminalChange: (value: string) => void;
  onShippingLineChange: (value: string) => void;
  onPortChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onDepartureDateChange: (value: string) => void;
  onArrivalDateChange: (value: string) => void;
  error?: {
    terminal?: string;
    port?: string;
    country?: string;
    shippingLine?: string;
    departureDate?: string;
    arrivalDate?: string;
  };
  isReadOnly?: {
    port?: boolean;
    country?: boolean;
  };
}

export default function ShipmentLogistics({
  terminal,
  port,
  country,
  shippingLine,
  terminals,
  shippingLines,
  departureDate,
  arrivalDate,
  onTerminalChange,
  onShippingLineChange,
  onPortChange,
  onCountryChange,
  onDepartureDateChange,
  onArrivalDateChange,
  error,
  isReadOnly = { port: true, country: true }
}: ShipmentLogisticsProps) {
  // Handle terminal selection
  const handleTerminalSelect = (terminalId: string) => {
    const selectedTerminal = terminals.find(t => t.name === terminalId);
    if (selectedTerminal) {
      onTerminalChange(selectedTerminal.name);
      onPortChange(selectedTerminal.port);
      onCountryChange(selectedTerminal.country);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <FormField label="Terminal" error={error?.terminal} required>
        <div className="relative">
          <Ship className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={terminal}
            onChange={(e) => handleTerminalSelect(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select terminal</option>
            {terminals.map(terminal => (
              <option key={terminal.id} value={terminal.name}>
                {terminal.name} ({terminal.port}, {terminal.country})
              </option>
            ))}
          </select>
        </div>
      </FormField>

      <FormField label="Shipping Line" error={error?.shippingLine} required>
        <div className="relative">
          <Ship className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={shippingLine}
            onChange={(e) => onShippingLineChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select shipping line</option>
            {shippingLines.map(line => (
              <option key={line.id} value={line.name}>
                {line.name}
              </option>
            ))}
          </select>
        </div>
      </FormField>

      <FormField label="Port" error={error?.port} required>
        <div className="relative">
          <Ship className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" 
            value={port}
            onChange={(e) => onPortChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            placeholder="Enter port name"
            readOnly={isReadOnly.port}
          />
        </div>
      </FormField>

      <FormField label="Country" error={error?.country} required>
        <div className="relative">
          <Ship className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" 
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            placeholder="Enter country name"
            readOnly={isReadOnly.country}
          />
        </div>
      </FormField>

      <FormField label="Departure Date" error={error?.departureDate} required>
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

      <FormField label="Arrival Date" error={error?.arrivalDate} required>
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
  );
}