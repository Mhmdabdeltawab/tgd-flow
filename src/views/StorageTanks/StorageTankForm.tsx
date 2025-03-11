import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Building2, Package2, AlertTriangle } from 'lucide-react';
import FormPage from '../../common/components/Form/FormPage';
import FormSection from '../../common/components/Form/FormSection';
import FormField from '../../common/components/Form/FormField';
import { useForm } from '../../common/hooks/useForm';
import { inventoryStore } from '../../common/stores/inventoryStore.tsx';
import { partyStore } from '../../common/stores/partyStore';
import { StorageTank } from '../../common/types/inventory';

type StorageTankFormData = Omit<StorageTank, 'id' | 'quantity' | 'createdAt' | 'updatedAt'>;

const initialFormData: StorageTankFormData = {
  name: '',
  terminalId: '',
  operatorId: '',
  operatorName: '',
  capacity: undefined,
  wasteTypes: [],
};

export default function StorageTankForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [initialFormState, setInitialFormState] = React.useState<StorageTankFormData>(initialFormData);

  // Track if terminal is selected to show waste types
  const [showWasteTypes, setShowWasteTypes] = React.useState(false);
  const [selectedTerminalCapacity, setSelectedTerminalCapacity] = React.useState<{
    total: number;
    used: number;
    remaining: number;
  } | null>(null);

  // Get all terminals
  const terminals = React.useMemo(() => {
    return inventoryStore.getAllTerminals();
  }, []);

  // Calculate terminal capacity details when terminal changes
  const updateTerminalCapacity = React.useCallback((terminalId: string) => {
    const terminal = terminals.find(t => t.id === terminalId);
    if (terminal && terminal.capacity) {
      // Get all storage tanks for this terminal
      const terminalTanks = inventoryStore.getStorageTanksByTerminal(terminalId);
      
      // Calculate total used capacity (excluding current tank if editing)
      const usedCapacity = terminalTanks
        .filter(tank => tank.id !== id) // Exclude current tank if editing
        .reduce((sum, tank) => sum + (tank.capacity || 0), 0);
      
      setSelectedTerminalCapacity({
        total: terminal.capacity,
        used: usedCapacity,
        remaining: terminal.capacity - usedCapacity
      });
    } else {
      setSelectedTerminalCapacity(null);
    }
  }, [terminals, id]);
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
      const storageTank = inventoryStore.getStorageTankById(id);
      if (storageTank) {
        setShowWasteTypes(true);
        const { id: _, quantity: __, createdAt: ___, updatedAt: ____, ...formData } = storageTank;
        setInitialFormState(formData);
      } else {
        navigate('/storage-tanks');
      }
    }
  }, [id, navigate]);

  // Custom validation function
  const validate = useCallback((data: StorageTankFormData) => {
    const errors: Partial<Record<keyof StorageTankFormData, string>> = {};
    
    // Get terminal to validate capacity
    const terminal = data.terminalId ? terminals.find(t => t.id === data.terminalId) : null;
    
    // Check if selected terminal has capacity set
    if (terminal && !terminal.capacity) {
      errors.terminalId = 'Selected terminal must have capacity set before adding storage tanks';
    }

    // Validate capacity against terminal's remaining capacity
    if (terminal && terminal.capacity && data.capacity) {
      // Get all storage tanks for this terminal (excluding current tank if editing)
      const terminalTanks = inventoryStore.getStorageTanksByTerminal(data.terminalId)
        .filter(tank => tank.id !== id);
      
      // Calculate total used capacity
      const usedCapacity = terminalTanks.reduce((sum, tank) => sum + (tank.capacity || 0), 0);
      
      // Calculate remaining capacity
      const remainingCapacity = terminal.capacity - usedCapacity;
      
      if (data.capacity > remainingCapacity) {
        errors.capacity = `Capacity exceeds terminal's remaining capacity (${remainingCapacity.toLocaleString()} MT available)`;
      }
    }

    if (!data.name) {
      errors.name = 'Name is required';
    }
    
    if (!data.terminalId) {
      errors.terminalId = 'Terminal is required';
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
      } else if (terminal && terminal.capacity && data.capacity > terminal.capacity) {
        errors.capacity = `Capacity cannot exceed terminal's total capacity (${terminal.capacity.toLocaleString()} MT)`;
      }
    }

    return errors;
  }, [terminals, id]);

  // Form submission handler
  const handleSubmit = useCallback(async (data: StorageTankFormData) => {
    if (id) {
      await inventoryStore.updateStorageTank(id, data);
    } else {
      await inventoryStore.createStorageTank(data);
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
    backTo: '/storage-tanks',
  });

  // Handle terminal selection
  const handleTerminalChange = (terminalId: string) => {
    handleChange('terminalId', terminalId);
    handleChange('wasteTypes', []); // Reset waste types when terminal changes
    handleChange('capacity', undefined); // Reset capacity when terminal changes
    setShowWasteTypes(!!terminalId);
    updateTerminalCapacity(terminalId);
  };

  // Handle operator selection
  const handleOperatorSelect = (operatorId: string) => {
    const operator = operators.find(op => op.id === operatorId);
    if (operator) {
      // Convert old format IDs to new format if needed
      const newId = operator.id
        .replace('SUP', 'SUPPLIER')
        .replace('BUY', 'BUYER');

      handleChange('operatorId', operator.id);
      handleChange('operatorName', operator.name);
    }
  };

  // Filter out duplicates and ensure unique IDs
  const uniqueOperators = React.useMemo(() => {
    const seen = new Set();
    return operators.filter(operator => {
      const newId = operator.id
        .replace('SUP', 'SUPPLIER')
        .replace('BUY', 'BUYER');
      if (seen.has(newId)) {
        return false;
      }
      seen.add(newId);
      return true;
    });
  }, [operators]);

  // Get selected terminal's waste types
  const selectedTerminal = terminals.find(t => t.id === formData.terminalId);
  const allowedWasteTypes = selectedTerminal?.wasteTypes || [];
  const hasWasteTypes = allowedWasteTypes.length > 0;

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
      title={id ? 'Edit Storage Tank' : 'New Storage Tank'}
      description={id ? `Editing storage tank ${id}` : 'Create a new storage tank'}
      backTo="/storage-tanks"
      onSave={submitForm}
      onCancel={handleCancel}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
    >
      <FormSection title="Basic Information">
        <div className="grid grid-cols-2 gap-6">
          <FormField label="Name" error={errors.name} required>
            <div className="relative">
              <Container className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter storage tank name"
              />
            </div>
          </FormField>

          <FormField label="Terminal" error={errors.terminalId} required>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={formData.terminalId}
                onChange={(e) => handleTerminalChange(e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2
                  ${errors.terminalId
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }
                `}
              >
                <option value="">Select terminal</option>
                {terminals.map(terminal => {
                  const hasCapacity = !!terminal.capacity;
                  return (
                    <option 
                      key={terminal.id} 
                      value={terminal.id}
                      className={!hasCapacity ? 'text-gray-400' : ''}
                    >
                      {terminal.name} ({terminal.port}, {terminal.country})
                      {!hasCapacity ? ' - No capacity set' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            {formData.terminalId && selectedTerminal && !selectedTerminal.capacity && (
              <div className="mt-2 flex items-start gap-2 text-sm text-red-600">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  This terminal does not have capacity set. Please set the terminal's capacity first
                  before adding storage tanks.
                </div>
              </div>
            )}
          </FormField>

          <FormField label="Operator" error={errors.operatorId} required>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={formData.operatorId}
                onChange={(e) => handleOperatorSelect(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select operator</option>
                {uniqueOperators.map(operator => {
                  const newId = operator.id
                    .replace('SUP', 'SUPPLIER')
                    .replace('BUY', 'BUYER');
                  return (
                  <option key={newId} value={operator.id}>
                    {operator.name}
                  </option>
                  );
                })}
              </select>
            </div>
          </FormField>
        </div>
      </FormSection>

      {showWasteTypes ? (
        <FormSection title="Waste Types">
          <FormField label="Select Waste Types" error={errors.wasteTypes} required>
            <div className="space-y-4">
              {!hasWasteTypes ? (
                <div className="flex items-center gap-2 p-4 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <div className="text-sm">
                    The selected terminal does not have any waste types configured.
                    Please select a different terminal or contact the terminal operator.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {allowedWasteTypes.map(type => (
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
              )}
            </div>
          </FormField>
        </FormSection>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Waste Types</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 p-4 bg-gray-50 text-gray-600 rounded-lg border border-gray-200">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div className="text-sm">
                Please select a terminal first to see available waste types.
              </div>
            </div>
          </div>
        </div>
      )}

      <FormSection title="Capacity">
        <FormField label="Total Capacity (MT)" error={errors.capacity} required={false}>
          <div className="relative">
            <Container className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={formData.capacity === undefined ? '' : formData.capacity}
              onChange={(e) => handleChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
              min="0"
              step="100"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter storage tank capacity"
            />
          </div>
          {selectedTerminalCapacity && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Terminal Capacity</div>
                  <div className="font-medium text-gray-900">
                    {selectedTerminalCapacity.total.toLocaleString()} MT
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Used Capacity</div>
                  <div className="font-medium text-gray-900">
                    {selectedTerminalCapacity.used.toLocaleString()} MT
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Remaining</div>
                  <div className="font-medium text-gray-900">
                    {selectedTerminalCapacity.remaining.toLocaleString()} MT
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      selectedTerminalCapacity.remaining / selectedTerminalCapacity.total < 0.1
                        ? 'bg-red-500'
                        : selectedTerminalCapacity.remaining / selectedTerminalCapacity.total < 0.25
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${(selectedTerminalCapacity.used / selectedTerminalCapacity.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
          {formData.capacity !== undefined && formData.capacity <= 0 && (
            <p className="mt-2 text-sm text-red-600">
              Capacity must be greater than 0
            </p>
          )}
        </FormField>
      </FormSection>
    </FormPage>
  );
}