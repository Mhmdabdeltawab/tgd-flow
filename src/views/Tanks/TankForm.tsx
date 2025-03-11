// Revert back to original file content before quality validation changes
import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../common/hooks/useToast';
import { useForm } from '../../common/hooks/useForm';
import FormPage from '../../common/components/Form/FormPage';
import FormSection from '../../common/components/Form/FormSection'; 
import QualityParameters from '../../common/components/Form/QualityParameters';
import TankShipmentSelect from '../../common/components/Form/TankShipmentSelect';
import TankStatusSelect from '../../common/components/Form/TankStatusSelect';
import TankDetails from '../../common/components/Form/TankDetails';
import { tankStore } from '../../common/stores/tankStore';
import { shipmentStore } from '../../common/stores/shipmentStore';
import { contractsStore } from '../../common/stores/contractsStore';
import { Tank, TankStatus } from '../../common/types/tank';

interface FormErrors {
  shipmentId?: string;
  status?: string;
  quantity?: string;
  quality?: string;
  departureDate?: string;
  arrivalDate?: string;
}

interface SelectedShipment {
  id: string;
  quantity: number;
  terminal: string;
  contractId: string;
  departureDate: string;
  arrivalDate: string;
}

type TankFormData = Omit<Tank, 'id' | 'createdAt' | 'updatedAt'>;

const initialFormData: TankFormData = {
  shipmentId: '',
  status: 'Loaded',
  quantity: 0,
  quality: {
    FFA: 0,
    IV: 0,
    S: 0,
    MI: 0
  },
  departureDate: '',
  arrivalDate: ''
};

export default function TankForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const [initialFormState] = React.useState<TankFormData>(initialFormData);
  const [selectedShipment, setSelectedShipment] = React.useState<SelectedShipment | null>(null);
  const [loadedInitialData, setLoadedInitialData] = React.useState(false);

  // Get contract specs for validation
  const contractSpecs = React.useMemo(() => {
    if (!selectedShipment) return null;
    const contract = contractsStore.getById(selectedShipment.contractId);
    if (!contract) return null;
    return {
      FFA: { value: Number(contract.qualityFFA), tolerance: 0.1 }, // 10% tolerance
      IV: { value: Number(contract.qualityIV), tolerance: 5 }, // ±5 points
      S: { value: Number(contract.qualityS), tolerance: 0.1 }, // 10% tolerance
      MI: { value: Number(contract.qualityM1), tolerance: 0.1 }, // 10% tolerance
    };
  }, [selectedShipment]);


  // Memoize shipments list to prevent unnecessary re-renders
  const shipments = React.useMemo(() => {
    // Filter out duplicates by ID
    const seen = new Set();
    return shipmentStore.getAll().filter(shipment => {
      if (seen.has(shipment.id)) {
        return false;
      }
      seen.add(shipment.id);
      return true;
    });
  }, []);

  // Calculate allocated and remaining quantities
  const getAllocatedQuantity = useCallback((shipmentId: string) => {
    const tanks = tankStore.getByShipmentId(shipmentId);
    return tanks.reduce((sum, tank) => sum + tank.quantity, 0);
  }, []);

  const getRemainingQuantity = React.useMemo(() => (shipment: any) => {
    if (!shipment) return 0;
    const allocated = getAllocatedQuantity(shipment.id);
    return shipment.quantity - allocated;
  }, [getAllocatedQuantity]);

  // Form validation
  const validate = useCallback((data: TankFormData): FormErrors => {
    const errors: FormErrors = {};

    if (!data.shipmentId) {
      errors.shipmentId = 'Shipment is required';
    }

    if (!data.status) {
      errors.status = 'Status is required';
    }

    if (!data.quantity || data.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    const remainingQty = getRemainingQuantity(selectedShipment);
    if (selectedShipment && data.quantity > remainingQty) {
      errors.quantity = `Quantity exceeds remaining shipment quantity`;
    }

    // Quality validation
    if (!data.quality) {
      errors.quality = 'Quality parameters are required';
    } else {
      if (data.quality.FFA < 0) errors.quality = 'FFA must be positive';
      if (data.quality.IV < 0) errors.quality = 'IV must be positive';
      if (data.quality.S < 0) errors.quality = 'S must be positive';
      if (data.quality.MI < 0) errors.quality = 'M&I must be positive';
    }

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
    }

    return errors;
  }, [selectedShipment, getRemainingQuantity]);

  // Form submission
  const handleSubmit = useCallback(async (data: TankFormData) => {
    try {
      if (id) {
        await tankStore.update(id, data);
        toast.success('Tank updated successfully');
      } else {
        await tankStore.create(data);
        toast.success('Tank created successfully');
      }
      navigate('/tanks');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save tank');
      throw error;
    }
  }, [id, navigate, toast]);

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
    backTo: '/tanks',
  });

  // Handle shipment selection
  const handleShipmentSelect = (shipmentId: string) => {
    const shipment = shipments.find(s => s.id === shipmentId);
    if (shipment) {
      setSelectedShipment(shipment);
      handleChange('shipmentId', shipment.id);
      handleChange('departureDate', shipment.departureDate);
      handleChange('arrivalDate', shipment.arrivalDate);
    }
  };

  // Load initial data if editing
  React.useEffect(() => {
    if (id && !loadedInitialData) {
      const tank = tankStore.getById(id);
      if (tank) {
        const { id: _, createdAt: __, updatedAt: ___, ...formData } = tank;
        
        // Load shipment details
        const shipment = shipmentStore.getById(tank.shipmentId);
        if (shipment) {
          setSelectedShipment(shipment);
          setLoadedInitialData(true);
        }

        // Update form data
        Object.entries(formData).forEach(([key, value]) => {
          handleChange(key, value);
        });
      } else {
        navigate('/tanks');
        toast.error('Tank not found');
      }
    }
  }, [id, navigate, handleChange, toast, loadedInitialData]);

  return (
    <FormPage
      title={id ? 'Edit Tank' : 'New Tank'}
      description={id ? `Editing tank ${id}` : 'Create a new tank'}
      backTo="/tanks"
      onSave={submitForm}
      onCancel={handleCancel}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
    >
      <FormSection title="Basic Information">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <TankShipmentSelect
              value={formData.shipmentId}
              onChange={handleShipmentSelect}
              shipments={shipments}
              error={errors.shipmentId}
              selectedShipment={selectedShipment}
              getAllocatedQuantity={getAllocatedQuantity}
              getRemainingQuantity={getRemainingQuantity}
            />
          </div>

          <div className="col-span-2 mt-6">
            <TankStatusSelect
              value={formData.status}
              onChange={(status) => handleChange('status', status)}
              error={errors.status}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Quantity">
        <TankDetails
          quantity={formData.quantity}
          departureDate={formData.departureDate}
          arrivalDate={formData.arrivalDate}
          maxQuantity={selectedShipment ? getRemainingQuantity(selectedShipment) : undefined}
          onQuantityChange={(value) => handleChange('quantity', value)}
          onDepartureDateChange={(value) => handleChange('departureDate', value)}
          onArrivalDateChange={(value) => handleChange('arrivalDate', value)}
          errors={{
            quantity: errors.quantity,
            departureDate: errors.departureDate,
            arrivalDate: errors.arrivalDate
          }}
        />
      </FormSection>

      <FormSection title="Quality Parameters">
        <QualityParameters
          value={formData.quality || { FFA: 0, IV: 0, S: 0, MI: 0 }}
          onChange={(quality) => handleChange('quality', quality)}
          contractSpecs={contractSpecs}
          error={errors.quality}
        />
      </FormSection>
    </FormPage>
  );
}