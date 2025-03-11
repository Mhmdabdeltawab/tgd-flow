import React from 'react';
import StatusBadge from '../StatusBadge/StatusBadge';
import FormField from './FormField';
import { TankStatus } from '../../types/tank';

const TANK_STATUSES: TankStatus[] = [
  'Loaded',
  'Discharged',
  'In Transit',
  'Delivered',
  'Received',
  'Cancelled'
];

interface TankStatusSelectProps {
  value: TankStatus;
  onChange: (status: TankStatus) => void;
  error?: string;
}

export default function TankStatusSelect({
  value,
  onChange,
  error
}: TankStatusSelectProps) {
  return (
    <FormField label="Status" error={error} required>
      <div className="flex gap-3">
        {TANK_STATUSES.map(status => (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            className={`
              flex-1 flex items-center gap-2 justify-center
              px-4 py-2 rounded-lg border-2 transition-all duration-200
              ${value === status
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <StatusBadge status={status} size="sm" />
          </button>
        ))}
      </div>
    </FormField>
  );
}