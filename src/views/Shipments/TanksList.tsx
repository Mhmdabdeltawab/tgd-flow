import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Ship, Calendar, FileText, AlertTriangle, XCircle } from 'lucide-react';
import { useToast } from '../../common/hooks/useToast';
import FormPage from '../../common/components/Form/FormPage';
import FormSection from '../../common/components/Form/FormSection';
import FormField from '../../common/components/Form/FormField';
import { useForm } from '../../common/hooks/useForm';
import { useDocuments } from '../../common/hooks/useDocuments';
import { DocumentUpload, DocumentList, DocumentViewer } from '../../common/components/Documents';
import { shipmentStore } from '../../common/stores/shipmentStore';
import { contractsStore } from '../../common/stores/contractsStore';
import { SHIPMENT_STATUSES, Shipment } from '../../common/types/shipment';
import StatusBadge from '../../common/components/StatusBadge/StatusBadge';
import { sharedEntitiesStore } from '../../common/stores/sharedEntitiesStore';
import { documentStore } from '../../common/stores/documentStore';
import { inventoryStore } from '../../common/stores/inventoryStore';

// Define strict types for form data and context
type ShipmentFormData = Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>;

interface SelectedContract {
  id: string;
  type: 'Supply' | 'Sales';
  productType: string;
  quantity: number;
  deliveryPort: string;
  deliveryCountry: string;
  deliveryDate: string;
  loadingStartDate: string;
  qualityFFA: string;
  qualityIV: string;
  qualityS: string;
  qualityM1: string;
}

const initialFormData: ShipmentFormData = {
  type: 'Supply',
  status: 'scheduled',
  contractId: '',
  productType: '',
  quantity: 0,
  quality: null,
  billOfLading: [],
  departureDate: '',
  arrivalDate: '',
  terminal: '',
  port: '',
  country: '',
  shippingLine: '',
  isFulfilled: false
};

function ShipmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const [initialFormState] = React.useState<ShipmentFormData>(initialFormData);
  const [selectedContract, setSelectedContract] = React.useState<SelectedContract | null>(null);
  const [existingShipments, setExistingShipments] = React.useState<Shipment[]>([]);

  // Calculate total shipped quantity for the selected contract
  const totalShippedQuantity = React.useMemo(() => {
    if (!selectedContract) return 0;
    return existingShipments
      .filter(s => s.id !== id) // Exclude current shipment if editing
      .reduce((sum, shipment) => sum + shipment.quantity, 0);
  }, [selectedContract, existingShipments, id]);

  // Calculate remaining quantity that can be shipped
  const remainingQuantity = React.useMemo(() => {
    if (!selectedContract) return 0;
    return Number(selectedContract.quantity) - totalShippedQuantity;
  }, [selectedContract, totalShippedQuantity]);

  const {
    documents,
    selectedDocument,
    handleUpload,
    handleDelete,
    handleView,
    closeViewer,
  } = useDocuments(id || 'new');

  // Form validation and submission setup
  const validate = useCallback((data: ShipmentFormData) => {
    const errors: Partial<Record<keyof ShipmentFormData, string>> = {};

    // Contract validation
    if (!data.contractId) {
      errors.contractId = 'Contract is required';
    }

    // Status validation  
    if (!data.status || !SHIPMENT_STATUSES.includes(data.status)) {
      errors.status = 'Status is required';
    }

    // Quantity validation
    if (!data.quantity || data.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    if (selectedContract && data.quantity > remainingQuantity) {
      errors.quantity = `Quantity exceeds remaining contract quantity (${remainingQuantity.toLocaleString()} MT available)`;
    }

    // Location validation
    if (!data.terminal) {
      errors.terminal = 'Terminal is required';
    }

    if (!data.port) {
      errors.port = 'Port is required';
    }

    if (!data.country) {
      errors.country = 'Country is required';
    }

    if (!data.shippingLine) {
      errors.shippingLine = 'Shipping line is required';
    }

    // Date validation
    if (!data.departureDate) {
      errors.departureDate = 'Departure date is required';
    }

    if (!data.arrivalDate) {
      errors.arrivalDate = 'Arrival date is required';
    }

    if (data.departureDate && data.arrivalDate) {
      const departure = new Date(data.departureDate);
      const arrival = new Date(data.arrivalDate);
      
      if (arrival < departure) {
        errors.arrivalDate = 'Arrival date must be after departure date';
      }

      // Validate against contract dates
      if (selectedContract) {
        const contractStart = new Date(selectedContract.loadingStartDate);
        const contractEnd = new Date(selectedContract.deliveryDate);

        if (departure < contractStart || departure > contractEnd) {
          errors.departureDate = 'Date must be within contract date range';
        }

        if (arrival < contractStart || arrival > contractEnd) {
          errors.arrivalDate = 'Date must be within contract date range';
        }
      }
    }

    return errors;
  }, [selectedContract, remainingQuantity]);

  const handleSubmit = useCallback(async (data: ShipmentFormData) => {
    try {
      const shipmentData = {
        ...data,
        quantity: Number(data.quantity),
        quality: data.quality || null,
        billOfLading: data.billOfLading || [],
        isFulfilled: false
      };

      if (id) {
        await shipmentStore.update(id, shipmentData);
        toast.success('Shipment updated successfully');
      } else {
        await shipmentStore.create(shipmentData);
        toast.success('Shipment created successfully');
      }
      navigate('/shipments');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save shipment');
      throw error;
    }
  }, [id, navigate]);

  const {
    formData,
    errors,
    isDirty,
    isSubmitting,
    handleChange,
    handleSubmit: submitForm,
    handleCancel
  } = useForm({
    initialData: initialFormState,
    onSubmit: handleSubmit,
    validate,
    backTo: '/shipments',
  });

  // Get all contracts and shipping lines
  const contracts = React.useMemo(() => contractsStore.getAll(), []);
  const shippingLines = React.useMemo(() => sharedEntitiesStore.getAllShippingLines(), []);
  const terminals = React.useMemo(() => inventoryStore.getAllTerminals(), []);

  // Handle contract selection
  const handleContractSelect = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      setSelectedContract({
        id: contract.id,
        type: contract.type,
        productType: contract.productType,
        quantity: Number(contract.quantity),
        deliveryPort: contract.deliveryPort,
        deliveryCountry: contract.deliveryCountry,
        deliveryDate: contract.deliveryDate,
        loadingStartDate: contract.loadingStartDate,
        qualityFFA: contract.qualityFFA,
        qualityIV: contract.qualityIV,
        qualityS: contract.qualityS,
        qualityM1: contract.qualityM1
      });

      // Get terminal for this port
      const terminal = terminals.find(t => t.port === contract.deliveryPort);

      // Get existing shipments for this contract
      const shipments = shipmentStore.getByContractId(contract.id);
      setExistingShipments(shipments);

      handleChange('contractId', contract.id);
      handleChange('type', contract.type);
      handleChange('productType', contract.productType);
      handleChange('terminal', terminal?.name || '');
      handleChange('port', contract.deliveryPort);
      handleChange('country', contract.deliveryCountry);
      handleChange('quantity', 0); // Reset quantity when contract changes
      handleChange('departureDate', contract.loadingStartDate);
      handleChange('arrivalDate', contract.deliveryDate);
    }
  };

  // Load initial data if editing
  React.useEffect(() => {
    if (id) {
      const shipment = shipmentStore.getById(id);
      if (!shipment) {
        navigate('/shipments');
        toast.error('Shipment not found');
        return;
      }

      // Load contract details
      const contract = contractsStore.getById(shipment.contractId);
      if (contract) {
        handleContractSelect(contract.id);
      }

      // Set form data
      const { id: _, createdAt: __, updatedAt: ___, ...formData } = shipment;
      // Update form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'quantity') {
          handleChange(key, Number(value));
        } else {
          handleChange(key, value);
        }
      });
    }
  }, [id, navigate, handleChange]);



  // Reset form when contract changes
  React.useEffect(() => {
    if (!id && selectedContract) {
      handleChange('quantity', 0);
    }
  }, [selectedContract, id]);

  const handleUploadWrapper = async (file: File, type: DocumentType) => {
    try {
      await handleUpload(file, type);
      // No need to manually refresh documents, useDocuments handles this
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload document');
    }
  };

  const handleDeleteWrapper = async (docId: string) => {
    try {
      await handleDelete(docId);
      // No need to manually refresh documents, useDocuments handles this
      toast.success('Document deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete document');
    }
  };

  return (
    <FormPage
      title={id ? 'Edit Shipment' : 'New Shipment'}
      description={id ? `Editing shipment ${id}` : 'Create a new shipment'}
      backTo="/shipments"
      onSave={submitForm}
      onCancel={handleCancel}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
    >

      <FormSection title="Basic Information">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <FormField label="Contract" error={errors.contractId} required>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={formData.contractId}
                  onChange={(e) => {
                    handleContractSelect(e.target.value);}}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select contract</option>
                  {contracts.map(contract => (
                    <option key={contract.id} value={contract.id}>
                      {contract.id} - {contract.productType} ({contract.type})
                    </option>
                  ))}
                </select>
              </div>
              {selectedContract && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Contract Quantity</div>
                      <div className="font-medium text-gray-900">
                        <div>{Number(selectedContract.quantity).toLocaleString()} MT</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {totalShippedQuantity > 0 && (
                            <>
                              {totalShippedQuantity.toLocaleString()} MT shipped •{' '}
                              {remainingQuantity.toLocaleString()} MT remaining
                            </>
                          )}
                        </div>
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
            <FormField label="Status" error={errors.status} required>
              <div className="flex gap-3">
                {SHIPMENT_STATUSES.map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleChange('status', status)}
                    className={`
                      flex-1 flex items-center gap-2 justify-center
                      px-4 py-2 rounded-lg border-2 transition-all duration-200
                      ${formData.status === status
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
          </div>
        </div>
      </FormSection>

      <FormSection title="Quantity">
        <FormField label="Quantity (MT)" error={errors.quantity} required>
          <div className="relative">
            <input
              type="number"
              value={formData.quantity || 0}
              onChange={(e) => handleChange('quantity', Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter quantity in metric tons"
              min="0"
              step="0.01"
              max={remainingQuantity}
            />
          </div>
          {selectedContract && (
            <div className="mt-2 text-sm text-gray-500">
              {totalShippedQuantity > 0 ? (
                <div className="flex items-center gap-2">
                  <Ship className="w-4 h-4" />
                  <span>
                    {totalShippedQuantity.toLocaleString()} MT already shipped in {existingShipments.length} shipment{existingShipments.length !== 1 ? 's' : ''} •{' '}
                    {remainingQuantity.toLocaleString()} MT remaining
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
      </FormSection>

      <FormSection title="Logistics">
        <div className="grid grid-cols-2 gap-6">
          <FormField label="Terminal" error={errors.terminal} required>
            <div className="relative">
              <Ship className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={formData.terminal}
                onChange={(e) => handleChange('terminal', e.target.value)}
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

          <FormField label="Shipping Line" error={errors.shippingLine} required>
            <div className="relative">
              <Ship className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={formData.shippingLine || ''}
                onChange={(e) => handleChange('shippingLine', e.target.value)}
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

          <FormField label="Port" error={errors.port} required>
            <div className="relative">
              <Ship className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" 
                value={formData.port}
                onChange={(e) => handleChange('port', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter port name"
              />
            </div>
          </FormField>

          <FormField label="Country" error={errors.country} required>
            <div className="relative">
              <Ship className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" 
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter country name"
              />
            </div>
          </FormField>

          <FormField label="Departure Date" error={errors.departureDate} required>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date" 
                value={formData.departureDate}
                onChange={(e) => handleChange('departureDate', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </FormField>

          <FormField label="Arrival Date" error={errors.arrivalDate} required>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date" 
                value={formData.arrivalDate}
                onChange={(e) => handleChange('arrivalDate', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min={formData.departureDate}
              />
            </div>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Documents">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Sustainability Declaration</h3>
          <DocumentUpload 
            onUpload={(file) => handleUploadWrapper(file, 'sustainability_declaration')}
            accept=".pdf,.jpg,.jpeg,.png"
            maxSize={10 * 1024 * 1024} // 10MB
            type="sustainability_declaration"
          />
          <DocumentList
            documents={documents.filter(doc => doc.type === 'sustainability_declaration')}
            onDelete={handleDeleteWrapper}
            onView={handleView}
          />

          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-700">Bill of Lading</h3>
            <div className="mt-2 text-sm text-gray-500">
              Optional - Can be uploaded later
            </div>
            <div className="mt-4">
              <DocumentUpload 
                onUpload={(file) => handleUploadWrapper(file, 'bill_of_lading')}
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={10 * 1024 * 1024} // 10MB
                type="bill_of_lading"
              />
              <DocumentList
                documents={documents.filter(doc => doc.type === 'bill_of_lading')}
                onDelete={handleDeleteWrapper}
                onView={handleView}
              />
            </div>
          </div>
        </div>
      </FormSection>

      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={closeViewer}
        />
      )}
    </FormPage>
  );
}

export default ShipmentForm;