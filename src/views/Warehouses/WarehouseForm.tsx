import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Globe2, Ship, Package2 } from 'lucide-react';
import FormPage from '../../common/components/Form/FormPage';
import FormSection from '../../common/components/Form/FormSection';
import FormField from '../../common/components/Form/FormField';
import { useForm } from '../../common/hooks/useForm';
import { inventoryStore } from '../../common/stores/inventoryStore.tsx';
import { partyStore } from '../../common/stores/partyStore';
import { countries } from '../../common/data/countries';
import { ports, getPortsByCountry } from '../../common/data/ports';
import { productTypes } from '../../common/data/productTypes';
import { Warehouse } from '../../common/types/inventory';

type WarehouseFormData = Omit<Warehouse, 'id' | 'quantity' | 'createdAt' | 'updatedAt'>;

const initialFormData: WarehouseFormData = {
  name: '',
  country: '',
  port: '',
  capacity: undefined,
  operatorId: '',
  operatorName: '',
  wasteTypes: [],
};

export default function WarehouseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [initialFormState, setInitialFormState] = React.useState<WarehouseFormData>(initialFormData);
  const [availablePorts, setAvailablePorts] = React.useState(ports);

  // Get all operators (suppliers and buyers)
  const operators = React.useMemo(() => {
    const suppliers = partyStore.getAll('suppliers');
    const buyers = partyStore.getAll('buyers');
    return [...suppliers, ...buyers].map(party => ({
      id: party.id,
      name: party.name
    }));
  }, []);

  // Load data if editing
  React.useEffect(() => {
    if (id) {
      const warehouse = inventoryStore.getWarehouseById(id);
      if (warehouse) {
        const { id: _, quantity: __, createdAt: ___, updatedAt: ____, ...formData } = warehouse;
        setInitialFormState(formData);
        if (formData.country) {
          setAvailablePorts(getPortsByCountry(formData.country));
        }
      } else {
        navigate('/warehouses');
      }
    }
  }, [id, navigate]);

  // Update available ports when country changes
  const handleCountryChange = useCallback((country: string) => {
    setAvailablePorts(getPortsByCountry(country));
  }, []);

  // Custom validation function
  const validate = useCallback((data: WarehouseFormData) => {
    const errors: Partial<Record<keyof WarehouseFormData, string>> = {};
    
    if (!data.name) {
      errors.name = 'Name is required';
    }
    
    if (!data.country) {
      errors.country = 'Country is required';
    }
    
    if (!data.operatorId) {
      errors.operatorId = 'Operator is required';
    }

    if (data.wasteTypes.length === 0) {
      errors.wasteTypes = 'At least one waste type must be selected';
    }

    // Only validate capacity if a value is provided
    if (data.capacity !== undefined && data.capacity !== null) {
      if (data.capacity <= 0) {
        errors.capacity = 'Capacity must be greater than 0';
      }
    }

    return errors;
  }, []);

  // Form submission handler
  const handleSubmit = useCallback(async (data: WarehouseFormData) => {
    if (id) {
      await inventoryStore.updateWarehouse(id, data);
    } else {
      await inventoryStore.createWarehouse(data);
    }
  }, [id]);

  const {
    formData,
    errors,
    isDirty,
    isSubmitting,
    handleChange,
    handleSubmit: submitForm,
    handleCancel,
  } = useForm({
    initialData: initialFormState,
    onSubmit: handleSubmit,
    validate,
    backTo: '/warehouses',
  });

  // Handle operator selection
  const handleOperatorChange = (operatorId: string) => {
    const operator = operators.find(op => op.id === operatorId);
    if (operator) {
      handleChange('operatorId', operator.id);
      handleChange('operatorName', operator.name);
    }
  };

  // Handle waste type toggle
  const handleWasteTypeToggle = (type: string) => {
    const currentTypes = formData.wasteTypes;
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    handleChange('wasteTypes', newTypes);
  };

  return (
    <FormPage
      title={id ? 'Edit Warehouse' : 'New Warehouse'}
      description={id ? `Editing warehouse ${id}` : 'Create a new warehouse'}
      backTo="/warehouses"
      onSave={submitForm}
      onCancel={handleCancel}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
    >
      <FormSection title="Basic Information">
        <div className="grid grid-cols-2 gap-6">
          <FormField label="Name" error={errors.name} required>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter warehouse name"
              />
            </div>
          </FormField>

          <FormField label="Operator" error={errors.operatorId} required>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={formData.operatorId}
                onChange={(e) => handleOperatorChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select operator</option>
                {operators.map(operator => (
                  <option key={operator.id} value={operator.id}>
                    {operator.name}
                  </option>
                ))}
              </select>
            </div>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Location">
        <div className="grid grid-cols-2 gap-6">
          <FormField label="Country" error={errors.country} required>
            <div className="relative">
              <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={formData.country}
                onChange={(e) => {
                  handleChange('country', e.target.value);
                  handleChange('port', '');
                  handleCountryChange(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select country</option>
                {countries.map(country => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </FormField>

          <FormField label="Port" error={errors.port}>
            <div className="relative">
              <Ship className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={formData.port || ''}
                onChange={(e) => handleChange('port', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!formData.country}
              >
                <option value="">Select port</option>
                {availablePorts.map(port => (
                  <option key={port.id} value={port.name}>
                    {port.name}
                  </option>
                ))}
              </select>
            </div>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Waste Types">
        <FormField label="Select Waste Types" error={errors.wasteTypes} required>
          <div className="grid grid-cols-3 gap-3">
            {productTypes.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => handleWasteTypeToggle(type)}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200
                  ${formData.wasteTypes.includes(type)
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Package2 className="w-4 h-4" />
                {type}
              </button>
            ))}
          </div>
        </FormField>
      </FormSection>
      
      <FormSection title="Capacity">
        <FormField label="Total Capacity (MT)" error={errors.capacity} required={false}>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={formData.capacity === undefined ? '' : formData.capacity}
              onChange={(e) => handleChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
              min="0"
              step="1000"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter warehouse capacity"
            />
          </div>
        </FormField>
      </FormSection>
    </FormPage>
  );
}