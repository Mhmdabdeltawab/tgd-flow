import { Shipment, ShipmentType, ShipmentStatus, BLStatus, ShipmentQuality } from '../types/shipment';
import { tankStore } from './tankStore';
import { contractsStore } from './contractsStore';

const STORAGE_KEY = 'shipments';

// Helper to check if storage needs initialization
const shouldInitialize = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return !data || JSON.parse(data).length === 0;
};

// Calculate weighted average quality from tanks
function calculateShipmentQuality(shipmentId: string): ShipmentQuality | null {
  const tanks = tankStore.getByShipmentId(shipmentId);
  const tanksWithQuality = tanks.filter(tank => tank.quality !== null);
  
  if (tanksWithQuality.length === 0) {
    return null;
  }

  const totalQuantity = tanksWithQuality.reduce((sum, tank) => sum + tank.quantity, 0);
  
  const weightedQuality: ShipmentQuality = {
    weightedAverageFFA: 0,
    weightedAverageIV: 0,
    weightedAverageS: 0,
    weightedAverageM1: 0
  };

  tanksWithQuality.forEach(tank => {
    if (tank.quality) {
      const weight = tank.quantity / totalQuantity;
      weightedQuality.weightedAverageFFA += tank.quality.FFA * weight;
      weightedQuality.weightedAverageIV += tank.quality.IV * weight;
      weightedQuality.weightedAverageS += tank.quality.S * weight;
      weightedQuality.weightedAverageM1 += tank.quality.MI * weight;
    }
  });

  return weightedQuality;
}

// Update shipment quality
function updateShipmentQuality(shipmentId: string): void {
  const shipments = shipmentStore.getAll();
  const index = shipments.findIndex(s => s.id === shipmentId);
  
  if (index === -1) return;

  const quality = calculateShipmentQuality(shipmentId);
  shipments[index].quality = quality;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
  
  // Dispatch storage event for cross-tab sync
  window.dispatchEvent(new StorageEvent('storage', {
    key: STORAGE_KEY,
    newValue: JSON.stringify(shipments)
  }));
}

// Sample data
const sampleShipments: Shipment[] = [
  {
    id: 'UCO-SUP-US-240209-001-SH-001',
    type: 'Supply',
    status: 'in_transit',
    contractId: 'UCO-SUPPLIER-US-240209-001',
    productType: 'UCO',
    quantity: 2500,
    quality: {
      weightedAverageFFA: 5,
      weightedAverageIV: 85,
      weightedAverageS: 2,
      weightedAverageM1: 0.8
    },
    billOfLading: [
      {
        id: 'BL-001',
        status: 'loaded',
        number: 'BL123456',
        issuedAt: '2024-02-20T00:00:00.000Z',
        loadedAt: '2024-02-20T00:00:00.000Z'
      }
    ],
    departureDate: '2024-02-20',
    arrivalDate: '2024-03-20',
    terminal: 'Rotterdam Terminal Alpha',
    port: 'Rotterdam',
    country: 'Netherlands',
    shippingLine: 'Pacific Star',
    isFulfilled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initialize storage
if (shouldInitialize()) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleShipments));
}

export const shipmentStore = {
  getAll: (): Shipment[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): Shipment | undefined => {
    const shipments = shipmentStore.getAll();
    return shipments.find(shipment => {
      if (shipment.id === id) {
        // Convert contract ID to new format if needed
        shipment.contractId = shipment.contractId
          .replace('SUP-', 'SUPPLIER-')
          .replace('SEL-', 'SALES-')
          .replace('UCO-SUP-', 'UCO-SUPPLIER-')
          .replace('UCO-SEL-', 'UCO-SALES-');
        return true;
      }
      return false;
    });
  },

  getByContractId: (contractId: string): Shipment[] => {
    const shipments = shipmentStore.getAll();
    return shipments.filter(shipment => shipment.contractId === contractId);
  },

  create: (data: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>): Shipment => {
    const shipments = shipmentStore.getAll();
    
    // Get contract to validate
    const contract = contractsStore.getById(data.contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    // Validate shipment type matches contract type
    if (data.type !== contract.type) {
      throw new Error(`Shipment type must match contract type (${contract.type})`);
    }

    // Generate sequence number for this contract
    const contractShipments = shipments.filter(s => s.contractId === data.contractId);
    const sequence = (contractShipments.length + 1).toString().padStart(3, '0');
    
    // Generate shipment ID
    const newId = `${data.contractId}-SH-${sequence}`;

    const newShipment: Shipment = {
      ...data,
      id: newId,
      quality: null, // Initialize quality as null
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    shipments.push(newShipment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
    return newShipment;
  },

  update: (id: string, updates: Partial<Shipment>): Shipment => {
    const shipments = shipmentStore.getAll();
    const index = shipments.findIndex(shipment => shipment.id === id);
    
    if (index === -1) {
      throw new Error(`Shipment with ID ${id} not found`);
    }

    const currentShipment = shipments[index];

    const updatedShipment = {
      ...currentShipment,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    shipments[index] = updatedShipment;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
    return updatedShipment;
  },

  delete: (id: string): void => {
    const shipments = shipmentStore.getAll();
    const shipment = shipments.find(s => s.id === id);
    
    if (!shipment) {
      throw new Error(`Shipment with ID ${id} not found`);
    }

    const filteredShipments = shipments.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredShipments));
  },

  // Quality management
  updateQuality: (id: string): void => {
    updateShipmentQuality(id);
  },

  getQuality: (id: string): ShipmentQuality | null => {
    const shipment = shipmentStore.getById(id);
    return shipment?.quality || null;
  },

  validateQualityAgainstContract: (id: string): boolean => {
    const shipment = shipmentStore.getById(id);
    if (!shipment || !shipment.quality) return false;

    const contract = contractsStore.getById(shipment.contractId);
    if (!contract) return false;

    // Check FFA within 10% tolerance
    const ffaSpec = Number(contract.qualityFFA);
    if (shipment.quality.weightedAverageFFA > ffaSpec * 1.1) return false;

    // Check IV within ±5 points
    const ivSpec = Number(contract.qualityIV);
    if (Math.abs(shipment.quality.weightedAverageIV - ivSpec) > 5) return false;

    // Check S within 10% tolerance
    const sSpec = Number(contract.qualityS);
    if (shipment.quality.weightedAverageS > sSpec * 1.1) return false;

    // Check M&I within 10% tolerance
    const m1Spec = Number(contract.qualityM1);
    if (shipment.quality.weightedAverageM1 > m1Spec * 1.1) return false;

    return true;
  },


  // Helper functions for routing
  getRoutedShipments: (salesContractId: string): Shipment[] => {
    return shipmentStore.getAll().filter(s => 
      s.routingDetails?.routedToContractId === salesContractId
    );
  },

  getRoutedQuantity: (salesContractId: string): number => {
    return shipmentStore.getRoutedShipments(salesContractId)
      .reduce((sum, s) => sum + s.quantity, 0);
  },

  validateRouting: (shipmentId: string, salesContractId: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const shipment = shipmentStore.getById(shipmentId);
    const contract = contractsStore.getById(salesContractId);

    // Basic validation
    if (!shipment || !contract) {
      errors.push('Invalid shipment or contract');
      return { isValid: false, errors };
    }

    // Core business rules
    if (shipment.type !== 'Supply') {
      errors.push('Only supply shipments can be routed');
    }

    if (contract.type !== 'Sales') {
      errors.push('Shipments can only be routed to sales contracts');
    }

    if (shipment.routingDetails) {
      errors.push('Shipment is already routed');
    }

    if (shipment.status === 'cancelled') {
      errors.push('Cannot route cancelled shipments');
    }

    if (contract.status === 'closed') {
      errors.push('Cannot route to closed contracts');
    }

    if (shipment.productType !== contract.productType) {
      errors.push('Product types must match');
    }

    // Quality validation
    if (shipment.quality) {
      const qualityValid = shipmentStore.validateQualityAgainstContract(shipmentId);
      if (!qualityValid) {
        warnings.push('Shipment quality does not meet contract specifications');
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  },

  routeShipment: (shipmentId: string, salesContractId: string): Shipment => {
    // Validate routing
    const validation = shipmentStore.validateRouting(shipmentId, salesContractId);
    if (!validation.isValid && validation.errors.length > 0) {
      throw new Error(validation.errors.join(', '));
    }
    
    // Update shipment with routing details
    const updatedShipment = shipmentStore.update(shipmentId, {
      routingDetails: {
        routedToContractId: salesContractId,
        routedAt: new Date().toISOString(),
        routedBy: 'system' // Replace with actual user when auth is added
      }
    });

    return updatedShipment;
  },

  unrouteShipment: (shipmentId: string): Shipment => {
    const shipment = shipmentStore.getById(shipmentId);
    
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    
    if (!shipment.routingDetails) {
      throw new Error('Shipment is not routed');
    }

    // Remove routing details
    const updatedShipment = shipmentStore.update(shipmentId, {
      routingDetails: undefined
    });

    return updatedShipment;
  }
};