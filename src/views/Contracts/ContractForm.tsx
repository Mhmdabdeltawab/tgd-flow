import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Mail, Phone, Globe2, User, Calendar } from 'lucide-react';
import FormPage from '../../common/components/Form/FormPage';
import FormSection from '../../common/components/Form/FormSection';
import FormField from '../../common/components/Form/FormField';
import { useForm } from '../../common/hooks/useForm';
import { contractsStore } from '../../common/stores/contractsStore';
import { Contract } from '../../common/types/contract';
import { countries } from '../../common/data/countries';
import { currencies } from '../../common/data/currencies';
import { incoterms } from '../../common/data/incoterms';
import { productTypes } from '../../common/data/productTypes';
import { paymentTerms } from '../../common/data/paymentTerms';
import { packingStandards } from '../../common/data/packingStandards';
import { ports, getPortsByCountry } from '../../common/data/ports';
import PartyInput from '../../common/components/Form/PartyInput';
import PortInput from '../../common/components/Form/PortInput';
import DocumentUpload from '../../common/components/Documents/DocumentUpload';
import DocumentList from '../../common/components/Documents/DocumentList';
import DocumentViewer from '../../common/components/Documents/DocumentViewer';
import { useDocuments } from '../../common/hooks/useDocuments';

type ContractFormData = Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>;

const initialFormData: ContractFormData = {
  type: 'Supply',
  status: 'opened',
  buyerId: '',
  sellerId: '',
  buyerName: '',
  sellerName: '',
  productType: '',
  incoterm: '',
  quantity: '',
  allowedVariance: '',
  unitPrice: '',
  currency: 'USD',
  paymentTerms: '',
  qualityFFA: '',
  qualityIV: '',
  qualityS: '',
  qualityM1: '',
  packingStandard: '',
  originCountry: '',
  deliveryCountry: '',
  deliveryPort: '',
  loadingStartDate: '',
  deliveryDate: '',
};
import { CONTRACT_STATUSES } from '../../common/types/contract';
import StatusBadge from '../../common/components/StatusBadge/StatusBadge';

export default function ContractForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    documents,
    selectedDocument,
    handleUpload,
    handleDelete,
    handleView,
    closeViewer
  } = useDocuments(id || 'new');
  const [initialFormState, setInitialFormState] = React.useState<ContractFormData>(initialFormData);
  const [availablePorts, setAvailablePorts] = React.useState(ports);

  // Load data if editing
  React.useEffect(() => {
    if (id) {
      const contract = contractsStore.getById(id);
      if (contract) {
        const { id: _, createdAt: __, updatedAt: ___, status: ____, ...formData } = contract;
        setInitialFormState(formData);
        if (formData.deliveryCountry) {
          setAvailablePorts(getPortsByCountry(formData.deliveryCountry));
        }
      } else {
        navigate('/contracts');
      }
    }
  }, [id, navigate]);

  // Update available ports when country changes
  const handleCountryChange = useCallback((country: string) => {
    setAvailablePorts(getPortsByCountry(country));
  }, []);

  // Custom validation function
  const validate = useCallback((data: ContractFormData) => {
    const errors: Partial<Record<keyof ContractFormData, string>> = {};
    
    // Check if product type is selected
    if (!data.productType) {
      errors.productType = 'Product type is required';
    }

    // Check if incoterm is selected
    if (!data.incoterm) {
      errors.incoterm = 'Incoterm is required';
    }

    // Required fields validation
    const requiredFields: (keyof ContractFormData)[] = [
      'buyerId', 'sellerId',
      'type', 'productType', 'incoterm', 'quantity',
      'allowedVariance', 'unitPrice', 'currency', 'paymentTerms',
      'qualityFFA', 'qualityIV', 'qualityS', 'qualityM1',
      'packingStandard', 'originCountry', 'deliveryCountry',
      'deliveryPort', 'loadingStartDate', 'deliveryDate'
    ];

    requiredFields.forEach(field => {
      if (!data[field]) {
        errors[field] = 'This field is required';
      }
    });

    // Validate quantity is a positive number
    if (data.quantity && (isNaN(Number(data.quantity)) || Number(data.quantity) <= 0)) {
      errors.quantity = 'Quantity must be a positive number';
    }
    
    // Validate unit price is a positive number
    if (data.unitPrice && (isNaN(Number(data.unitPrice)) || Number(data.unitPrice) <= 0)) {
      errors.unitPrice = 'Unit price must be a positive number';
    }

    // Validate allowed variance is between 0 and 100
    const variance = Number(data.allowedVariance);
    if (data.allowedVariance && (isNaN(variance) || variance < 0 || variance > 100)) {
      errors.allowedVariance = 'Allowed variance must be between 0 and 100';
    }

    // Validate dates
    if (data.loadingStartDate && data.deliveryDate) {
      const loadingDate = new Date(data.loadingStartDate);
      const deliveryDate = new Date(data.deliveryDate);
      if (deliveryDate < loadingDate) {
        errors.deliveryDate = 'Delivery date must be after loading start date';
      }
    }

    return errors;
  }, []);

  // Form submission handler
  const handleSubmit = useCallback(async (data: ContractFormData) => {
    if (id) {
      await contractsStore.update(id, data);
      navigate('/contracts');
    } else {
      await contractsStore.create(data);
      navigate('/contracts');
    }
  }, [id, navigate]);

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
    backTo: '/contracts',
  });

  return (
    <FormPage
      title={id ? 'Edit Contract' : 'New Contract'}
      description={id ? `Editing contract ${id}` : 'Create a new contract'}
      backTo="/contracts"
      onSave={submitForm}
      onCancel={handleCancel}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
    >
      <FormSection title="Contract Type">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handleChange('type', 'Supply')}
                className={`
                  flex-1 flex items-center gap-3 justify-center
                  px-6 py-4 rounded-xl border-2 transition-all duration-200
                  ${formData.type === 'Supply'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Building2 className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Supply Contract</div>
                  <div className="text-sm opacity-75">Purchase from suppliers</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleChange('type', 'Sales')}
                className={`
                  flex-1 flex items-center gap-3 justify-center
                  px-6 py-4 rounded-xl border-2 transition-all duration-200
                  ${formData.type === 'Sales'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <User className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Sales Contract</div>
                  <div className="text-sm opacity-75">Sell to customers</div>
                </div>
              </button>
            </div>
          </div>

          <div className="col-span-2 mt-6">
            <FormField label="Status" error={errors.status} required>
              <div className="flex gap-3">
                {CONTRACT_STATUSES.map(status => (
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

      <FormSection title="Parties">
        <div className="grid grid-cols-2 gap-6">
          <PartyInput
            type="buyers"
            id={formData.buyerId}
            name={formData.buyerName}
            onIdChange={(value) => handleChange('buyerId', value)}
            onNameChange={(value) => handleChange('buyerName', value)}
            error={errors.buyerId || errors.buyerName}
            required
          />
          <PartyInput
            type="sellers"
            id={formData.sellerId}
            name={formData.sellerName}
            onIdChange={(value) => handleChange('sellerId', value)}
            onNameChange={(value) => handleChange('sellerName', value)}
            error={errors.sellerId || errors.sellerName}
            required
          />
        </div>
      </FormSection>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <FormSection title="Commercial Terms">
            <div className="space-y-4">
              <FormField label="Product Type" error={errors.productType} required>
                <select
                  value={formData.productType}
                  onChange={(e) => handleChange('productType', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select product type</option>
                  {productTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Incoterm" error={errors.incoterm} required>
                <select
                  value={formData.incoterm}
                  onChange={(e) => handleChange('incoterm', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select incoterm</option>
                  {incoterms.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Quantity" error={errors.quantity} required>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter quantity"
                    min="0"
                  />
                </FormField>

                <FormField label="Allowed Variance (%)" error={errors.allowedVariance} required>
                  <input
                    type="number"
                    value={formData.allowedVariance}
                    onChange={(e) => handleChange('allowedVariance', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter allowed variance"
                    min="0"
                    max="100"
                  />
                </FormField>
              </div>
            </div>
          </FormSection>

          <FormSection title="Financial Terms">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Unit Price" error={errors.unitPrice} required>
                  <input
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) => handleChange('unitPrice', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter unit price"
                    min="0"
                    step="0.01"
                  />
                </FormField>

                <FormField label="Currency" error={errors.currency} required>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
              
              <FormField label="Payment Terms" error={errors.paymentTerms} required>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => handleChange('paymentTerms', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select payment terms</option>
                  {paymentTerms.map(term => (
                    <option key={term} value={term}>{term.replace('_', ' ')}</option>
                  ))}
                </select>
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Quality Parameters">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="FFA" error={errors.qualityFFA} required>
                <input
                  type="text"
                  value={formData.qualityFFA}
                  onChange={(e) => handleChange('qualityFFA', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter FFA value"
                />
              </FormField>
              <FormField label="IV" error={errors.qualityIV} required>
                <input
                  type="text"
                  value={formData.qualityIV}
                  onChange={(e) => handleChange('qualityIV', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter IV value"
                />
              </FormField>
              <FormField label="S" error={errors.qualityS} required>
                <input
                  type="text"
                  value={formData.qualityS}
                  onChange={(e) => handleChange('qualityS', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter S value"
                />
              </FormField>
              <FormField label="M&I" error={errors.qualityM1} required>
                <input
                  type="text"
                  value={formData.qualityM1}
                  onChange={(e) => handleChange('qualityM1', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter M&I value"
                />
              </FormField>
            </div>
          </FormSection>
        </div>

        <div>
          <FormSection title="Logistics">
            <div className="space-y-4">
              <FormField label="Packing Standard" error={errors.packingStandard} required>
                <select
                  value={formData.packingStandard}
                  onChange={(e) => handleChange('packingStandard', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select packing standard</option>
                  {packingStandards.map(standard => (
                    <option key={standard} value={standard}>{standard}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Origin Country" error={errors.originCountry} required>
                <select
                  value={formData.originCountry}
                  onChange={(e) => handleChange('originCountry', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select origin country</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.name}>{country.name}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Delivery Country" error={errors.deliveryCountry} required>
                <select
                  value={formData.deliveryCountry}
                  onChange={(e) => {
                    handleChange('deliveryCountry', e.target.value);
                    handleChange('deliveryPort', '');
                    handleCountryChange(e.target.value);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select delivery country</option>
                  {countries?.map(country => (
                    <option key={country.code} value={country.name}>{country.name}</option>
                  )) || null}
                </select>
              </FormField>

              <PortInput
                ports={availablePorts}
                value={formData.deliveryPort}
                onChange={(value) => handleChange('deliveryPort', value)}
                error={errors.deliveryPort}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Loading Start Date" error={errors.loadingStartDate} required>
                  <input
                    type="date"
                    value={formData.loadingStartDate}
                    onChange={(e) => handleChange('loadingStartDate', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </FormField>

                <FormField label="Delivery Date" error={errors.deliveryDate} required>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => handleChange('deliveryDate', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </FormField>
              </div>
            </div>
          </FormSection>

          <FormSection title="Commercial Agreement">
            <div className="space-y-4">
              <DocumentUpload
                onUpload={handleUpload}
                contractId={id || 'new'}
              />
              <DocumentList
                documents={documents}
                onView={handleView}
                onDelete={handleDelete}
              />
            </div>
          </FormSection>

          {selectedDocument && (
            <DocumentViewer
              document={selectedDocument}
              onClose={closeViewer}
            />
          )}
        </div>
      </div>
    </FormPage>
  );
}