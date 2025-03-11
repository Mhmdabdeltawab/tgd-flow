import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../common/hooks/useToast';
import { shipmentStore } from '../../../common/stores/shipmentStore';
import { contractsStore } from '../../../common/stores/contractsStore';
import { inventoryStore } from '../../../common/stores/inventoryStore';
import { documentStore } from '../../../common/stores/documentStore';
import { Shipment, ShipmentStatus } from '../../../common/types/shipment';
import { Contract } from '../../../common/types/contract';

interface UseShipmentFormConfig {
  id?: string;
  onSuccess?: () => void;
}

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

export function useShipmentForm({ id, onSuccess }: UseShipmentFormConfig = {}) {
  const navigate = useNavigate();
  const toast = useToast();
  const [loadedInitialData, setLoadedInitialData] = useState(false);
  const [selectedContract, setSelectedContract] = useState<SelectedContract | null>(null);
  const [existingShipments, setExistingShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<Shipment>>({
    type: 'Supply',
    status: 'scheduled',
    contractId: '',
    productType: '',
    quantity: 0,
    quality: null,
    departureDate: '',
    arrivalDate: '',
    terminal: '',
    port: '',
    country: '',
    shippingLine: '',
    isFulfilled: false
  });

  // Calculate metrics
  const totalShippedQuantity = selectedContract 
    ? existingShipments
        .filter(s => s.id !== id)
        .reduce((sum, s) => sum + s.quantity, 0)
    : 0;

  const remainingQuantity = selectedContract
    ? Number(selectedContract.quantity) - totalShippedQuantity
    : 0;

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!id || loadedInitialData) {
        setIsLoading(false);
        return;
      }

      try {
        const shipment = shipmentStore.getById(id);
        if (!shipment) {
          toast.error('Shipment not found');
          navigate('/shipments');
          return;
        }

        // Get contract with proper ID format handling
        const contract = contractsStore.getById(shipment.contractId);

        if (!contract) {
          toast.error('Contract not found');
          navigate('/shipments');
          return;
        }

        // Set selected contract
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

        // Get existing shipments
        const shipments = shipmentStore.getByContractId(contract.id);
        setExistingShipments(shipments);

        // Set initial form data
        const { id: _, createdAt: __, updatedAt: ___, ...formData } = shipment;
        setInitialData(formData);
        setLoadedInitialData(true);

      } catch (error) {
        toast.error('Failed to load shipment data');
        navigate('/shipments');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, loadedInitialData]);

  // Handle contract selection
  const handleContractSelect = useCallback((contractId: string) => {
    const contract = contractsStore.getById(contractId);
    if (!contract) {
      toast.error('Contract not found');
      return;
    }

    // Get terminal for this port
    const terminal = inventoryStore.getAllTerminals()
      .find(t => t.port === contract.deliveryPort);

    // Set selected contract
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

    // Get existing shipments
    const shipments = shipmentStore.getByContractId(contract.id);
    setExistingShipments(shipments);

    // Return form updates
    return {
      contractId: contract.id,
      type: contract.type,
      productType: contract.productType,
      terminal: terminal?.name || '',
      port: contract.deliveryPort,
      country: contract.deliveryCountry,
      departureDate: contract.loadingStartDate,
      arrivalDate: contract.deliveryDate,
      quantity: 0 // Reset quantity when contract changes
    };
  }, [toast]);

  // Validate form data
  const validateForm = useCallback((data: Partial<Shipment>) => {
    const errors: Record<string, string> = {};

    if (!data.contractId) errors.contractId = 'Contract is required';
    if (!data.status) errors.status = 'Status is required';
    if (!data.quantity || data.quantity <= 0) errors.quantity = 'Quantity must be greater than 0';
    if (!data.terminal) errors.terminal = 'Terminal is required';
    if (!data.port) errors.port = 'Port is required';
    if (!data.country) errors.country = 'Country is required';
    if (!data.shippingLine) errors.shippingLine = 'Shipping line is required';
    if (!data.departureDate) errors.departureDate = 'Departure date is required';
    if (!data.arrivalDate) errors.arrivalDate = 'Arrival date is required';

    // Validate quantity against remaining
    if (selectedContract && data.quantity && data.quantity > remainingQuantity) {
      errors.quantity = `Quantity exceeds remaining contract quantity (${remainingQuantity.toLocaleString()} MT available)`;
    }

    // Validate dates
    if (data.departureDate && data.arrivalDate) {
      const departure = new Date(data.departureDate);
      const arrival = new Date(data.arrivalDate);
      
      if (arrival < departure) {
        errors.arrivalDate = 'Arrival date must be after departure date';
      }

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

  // Save shipment
  const saveShipment = useCallback(async (data: Partial<Shipment>, documents: Document[]) => {
    try {
      if (id) {
        await shipmentStore.update(id, data as Shipment);
        toast.success('Shipment updated successfully');
      } else {
        const newShipment = await shipmentStore.create(data as Shipment);
        
        // Save documents for new shipment
        if (documents.length > 0) {
          for (const doc of documents) {
            await documentStore.add(newShipment.id, doc);
          }
        }
        
        toast.success('Shipment created successfully');
      }

      onSuccess?.();
      navigate('/shipments');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save shipment');
      throw error;
    }
  }, [id, navigate, toast, onSuccess]);

  return {
    isLoading,
    selectedContract,
    existingShipments,
    totalShippedQuantity,
    remainingQuantity,
    initialData,
    handleContractSelect,
    validateForm,
    saveShipment
  };
}