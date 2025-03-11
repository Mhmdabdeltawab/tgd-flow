import React from 'react';
import { Ship } from 'lucide-react';
import FormField from './FormField';

interface PortInputProps {
  label?: string;
  value: string;
  country?: string;
  ports?: any[];
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export default function PortInput({
  label = 'Port',
  value,
  country,
  ports: availablePorts = [],
  onChange,
  error,
  required
}: PortInputProps) {
  return (
    <FormField label={label} error={error} required={required}>
      <div className="relative">
        <Ship className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full pl-10 pr-4 py-2.5 
            border rounded-lg appearance-none
            text-sm text-gray-900
            transition-colors duration-200
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }
            focus:outline-none focus:ring-2
          `}
        >
          <option value="">
            {country ? 'Select port' : 'Select country first'}
          </option>
          {availablePorts?.map((port) => (
            <option key={port.id} value={port.name}>
              {port.name}
            </option>
          ))}
        </select>
      </div>
      {country && availablePorts.length === 0 && (
        <p className="mt-2 text-sm text-amber-600">
          No ports available for {country}
        </p>
      )}
    </FormField>
  );
}