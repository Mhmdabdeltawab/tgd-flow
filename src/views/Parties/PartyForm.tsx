import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Mail, Phone, Globe2, User, Calendar } from 'lucide-react';
import { countries } from '../../common/data/countries';
import FormPage from '../../common/components/Form/FormPage';
import FormSection from '../../common/components/Form/FormSection';
import FormField from '../../common/components/Form/FormField';
import { useForm } from '../../common/hooks/useForm';
import { partyStore } from '../../common/stores/partyStore';
import { PartyFormData, PartyType } from '../../common/types/party';

const initialFormData: PartyFormData = {
  name: '',
  country: '',
  countryCode: '',
  accountManager: '',
  email: '',
  phone: '',
  isccNumber: '',
  isccExpiry: '',
};

interface PartyFormProps {
  type: PartyType;
}

export default function PartyForm({ type }: PartyFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [initialFormState, setInitialFormState] = React.useState<PartyFormData>(initialFormData);

  // Load data if editing
  React.useEffect(() => {
    if (id) {
      try {
        const party = partyStore.getById(type, id);
        if (party) {
          const { id: _, createdAt: __, updatedAt: ___, ...formData } = party;
          setInitialFormState({ ...initialFormData, ...formData });
        } else {
          navigate(`/${type}`);
        }
      } catch (error) {
        console.error('Error loading party:', error);
        navigate(`/${type}`);
      }
    }
  }, [id, navigate, type]);

  // Custom validation function
  const validate = useCallback((data: PartyFormData) => {
    const errors: Partial<Record<keyof PartyFormData, string>> = {};
    
    // Validate email format
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate phone format (basic check)
    if (data.phone && !/^\+?[\d\s-]+$/.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Validate ISCC expiry date
    if (data.isccExpiry) {
      const expiryDate = new Date(data.isccExpiry);
      if (isNaN(expiryDate.getTime())) {
        errors.isccExpiry = 'Please enter a valid date';
      } else if (expiryDate < new Date()) {
        errors.isccExpiry = 'Expiry date cannot be in the past';
      }
    }

    return errors;
  }, []);

  // Form submission handler
  const handleSubmit = useCallback(async (data: PartyFormData) => {
    if (id) {
      await partyStore.update(type, id, data);
    } else {
      await partyStore.create(type, data);
    }
  }, [id, type]);

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
    backTo: `/${type}`,
  });

  const handleCountryChange = (country: string, code: string) => {
    handleChange('country', country);
    handleChange('countryCode', code);
  };

  const title = type === 'suppliers' ? 'Supplier' : 'Buyer';

  return (
    <FormPage
      title={id ? `Edit ${title}` : `New ${title}`}
      description={id ? `Editing ${title.toLowerCase()} ${id}` : `Create a new ${title.toLowerCase()}`}
      backTo={`/${type}`}
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
                placeholder={`Enter ${title.toLowerCase()} name`}
              />
            </div>
          </FormField>

          <FormField label="Account Manager" error={errors.accountManager} required>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.accountManager}
                onChange={(e) => handleChange('accountManager', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter account manager name"
              />
            </div>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Contact Information">
        <div className="grid grid-cols-2 gap-6">
          <FormField label="Email" error={errors.email} required>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter email address"
              />
            </div>
          </FormField>

          <FormField label="Phone" error={errors.phone} required>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter phone number"
              />
            </div>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Location">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <FormField label="Country" error={errors.country} required>
              <div className="relative">
                <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={formData.countryCode}
                  onChange={(e) => {
                    const country = countries.find(c => c.code === e.target.value);
                    if (country) {
                      handleChange('country', country.name);
                      handleChange('countryCode', country.code);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select country</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
              </div>
            </FormField>
          </div>
        </div>
      </FormSection>

      <FormSection title="ISCC Information">
        <div className="grid grid-cols-2 gap-6">
          <FormField label="ISCC Number" error={errors.isccNumber} required>
            <input
              type="text"
              value={formData.isccNumber}
              onChange={(e) => handleChange('isccNumber', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter ISCC number"
            />
          </FormField>

          <FormField label="ISCC Expiry" error={errors.isccExpiry} required>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={formData.isccExpiry}
                onChange={(e) => handleChange('isccExpiry', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </FormField>
        </div>
      </FormSection>
    </FormPage>
  );
}