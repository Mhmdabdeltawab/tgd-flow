import React from 'react';
import { Building2, User } from 'lucide-react';
import { partyStore } from '../../stores/partyStore';
import { countries } from '../../data/countries';
import { useToast } from '../../hooks/useToast';
import FormField from './FormField';

interface PartyInputProps {
  type: 'buyers' | 'sellers';
  id: string;
  name: string;
  onIdChange: (value: string) => void;
  onNameChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export default function PartyInput({
  type,
  id,
  name,
  onIdChange,
  onNameChange,
  error,
  required,
}: PartyInputProps) {
  const toast = useToast();
  const Icon = type === 'buyers' ? Building2 : User;
  const label = type === 'buyers' ? 'Buyer' : 'Supplier';

  // Get initial options
  const [options, setOptions] = React.useState(() => {
    const parties = partyStore.getAll(type === 'sellers' ? 'suppliers' : type);
    return parties.map(party => ({
      id: party.id,
      name: party.name
    }));
  });
  
  // Refresh options when localStorage changes
  React.useEffect(() => {
    const handleStorageChange = () => {
      const parties = partyStore.getAll(type === 'sellers' ? 'suppliers' : type);
      setOptions(parties.map(party => ({
        id: party.id,
        name: party.name
      })));
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // Load initial data
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [type]);

  const handleSelect = (selectedId: string) => {
    const selected = options.find(option => option.id === selectedId);
    if (selected) {
      onIdChange(selected.id);
      onNameChange(selected.name);
    } else {
      onIdChange('');
      onNameChange('');
    }
  };

  // Filter out duplicates by ID before rendering
  const uniqueOptions = React.useMemo(() => {
    const seen = new Set();
    return options.filter(option => {
      if (seen.has(option.id)) {
        return false;
      }
      seen.add(option.id);
      return true;
    });
  }, [options]);

  return (
    <FormField label={label} error={error} required={required}>
      <div className="space-y-4">
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            value={id}
            onChange={(e) => handleSelect(e.target.value)}
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
            <option value="">Select {label}</option>
            {uniqueOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} ({option.id})
              </option>
            ))}
          </select>
        </div>

        {id && name && (
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">{name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{id}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FormField>
  );
}