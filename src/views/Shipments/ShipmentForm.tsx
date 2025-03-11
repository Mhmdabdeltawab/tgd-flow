import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormPage from '../../common/components/Form/FormPage';
import FormSection from '../../common/components/Form/FormSection';
import { useForm } from '../../common/hooks/useForm';
import { useDocuments } from '../../common/hooks/useDocuments';
import { DocumentUpload, DocumentList, DocumentViewer } from '../../common/components/Documents';
import { contractsStore } from '../../common/stores/contractsStore';
import { sharedEntitiesStore } from '../../common/stores/sharedEntitiesStore';
import { inventoryStore } from '../../common/stores/inventoryStore';
import { useShipmentForm } from './hooks/useShipmentForm';
import ShipmentFormSkeleton from './components/ShipmentFormSkeleton';
import ShipmentBasicInfo from '../../common/components/Form/ShipmentBasicInfo';
import ShipmentLogistics from '../../common/components/Form/ShipmentLogistics';
import ShipmentQuantity from '../../common/components/Form/ShipmentQuantity';
import { useToast } from '../../common/hooks/useToast';
import { DocumentType } from '../../common/types/document';
import { SHIPMENT_STATUSES } from '../../common/types/shipment';

const initialFormData = {
  type: 'Supply' as const,
  status: 'scheduled' as const,
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
} as const;

function ShipmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const {
    isLoading,
    selectedContract,
    existingShipments,
    totalShippedQuantity,
    remainingQuantity,
    initialData,
    handleContractSelect,
    validateForm,
    saveShipment
  } = useShipmentForm({ id });

  const {
    documents,
    selectedDocument,
    handleUpload,
    handleDelete,
    handleView,
    closeViewer,
  } = useDocuments(id || 'new');

  const {
    formData,
    errors,
    isDirty,
    isSubmitting,
    handleChange,
    handleSubmit: submitForm,
    handleCancel
  } = useForm({
    initialData: initialData || initialFormData,
    onSubmit: (data) => saveShipment(data, documents),
    validate: validateForm,
    backTo: '/shipments',
  });

  // Get all contracts and shipping lines
  const contracts = React.useMemo(() => contractsStore.getAll(), []);
  const shippingLines = React.useMemo(() => sharedEntitiesStore.getAllShippingLines(), []);
  const terminals = React.useMemo(() => inventoryStore.getAllTerminals(), []);

  const handleUploadWrapper = async (file: File, type: DocumentType) => {
    try {
      await handleUpload(file, type);
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload document');
    }
  };

  const handleDeleteWrapper = async (docId: string) => {
    try {
      await handleDelete(docId);
      toast.success('Document deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete document');
    }
  };

  if (isLoading) {
    return <ShipmentFormSkeleton />;
  }

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
        <ShipmentBasicInfo
          contractId={formData.contractId}
          status={formData.status}
          contracts={contracts}
          onContractSelect={handleContractSelect}
          onStatusChange={(status) => handleChange('status', status)}
          selectedContract={selectedContract}
          existingShipments={selectedContract ? {
            count: existingShipments.length,
            totalQuantity: totalShippedQuantity,
            remainingQuantity
          } : undefined}
          error={{
            contractId: errors.contractId,
            status: errors.status
          }}
        />
      </FormSection>

      <FormSection title="Quantity">
        <ShipmentQuantity
          quantity={formData.quantity}
          maxQuantity={remainingQuantity}
          onChange={(value) => handleChange('quantity', value)}
          error={errors.quantity}
          selectedContract={selectedContract ? {
            totalShippedQuantity,
            existingShipments: existingShipments.length,
            remainingQuantity
          } : undefined}
        />
      </FormSection>

      <FormSection title="Logistics">
        <ShipmentLogistics
          terminal={formData.terminal}
          port={formData.port}
          country={formData.country}
          shippingLine={formData.shippingLine}
          departureDate={formData.departureDate}
          arrivalDate={formData.arrivalDate}
          terminals={terminals}
          shippingLines={shippingLines}
          onTerminalChange={(value) => handleChange('terminal', value)}
          onShippingLineChange={(value) => handleChange('shippingLine', value)}
          onPortChange={(value) => handleChange('port', value)}
          onCountryChange={(value) => handleChange('country', value)}
          onDepartureDateChange={(value) => handleChange('departureDate', value)}
          onArrivalDateChange={(value) => handleChange('arrivalDate', value)}
          error={{
            terminal: errors.terminal,
            port: errors.port,
            country: errors.country,
            shippingLine: errors.shippingLine,
            departureDate: errors.departureDate,
            arrivalDate: errors.arrivalDate
          }}
        />
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