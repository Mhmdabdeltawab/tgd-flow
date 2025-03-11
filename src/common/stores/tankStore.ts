import { Tank, TankStatus, TankQuality } from '../types/tank';
import { shipmentStore } from './shipmentStore';
import { contractsStore } from './contractsStore';
import { validateQualityRanges, validateQualityAgainstContract } from '../utils/qualityValidation';

import { QUALITY_RANGES, TankQuality } from '../types/tank';

// Helper to validate quality parameters
function validateQuality(quality: TankQuality) {
  const errors: Partial<Record<keyof TankQuality, string>> = {};
  let isValid = true;

  Object.entries(quality).forEach(([key, value]) => {
    const range = QUALITY_RANGES[key as keyof TankQuality];
    if (value === undefined || value === null) {
      errors[key as keyof TankQuality] = 'Value is required';
      isValid = false;
    } else if (value < range.min || value > range.max) {
      errors[key as keyof TankQuality] = `Must be between ${range.min} and ${range.max}`;
      isValid = false;
    }
  });

  return { isValid, errors };
}

// Helper to validate tank against contract quality specs
function validateAgainstContract(quality: TankQuality, shipmentId: string): QualityValidation {
  const errors: Partial<Record<keyof TankQuality, string>> = {};
  let isValid = true;

  const shipment = shipmentStore.getById(shipmentId);
  if (!shipment) return { isValid: true, errors: {} };

  const contract = contractsStore.getById(shipment.contractId);
  if (!contract) return { isValid: true, errors: {} };

  // Validate FFA
  if (quality.FFA > Number(contract.qualityFFA) * 1.1) {
    errors.FFA = `Exceeds contract spec (${contract.qualityFFA}) by more than 10%`;
    isValid = false;
  }

  // Validate IV
  if (Math.abs(quality.IV - Number(contract.qualityIV)) > 5) {
    errors.IV = `Outside contract spec range (${contract.qualityIV} ± 5)`;
    isValid = false;
  }

  // Validate S
  if (quality.S > Number(contract.qualityS) * 1.1) {
    errors.S = `Exceeds contract spec (${contract.qualityS}) by more than 10%`;
    isValid = false;
  }

  // Validate MI
  if (quality.MI > Number(contract.qualityM1) * 1.1) {
    errors.MI = `Exceeds contract spec (${contract.qualityM1}) by more than 10%`;
    isValid = false;
  }

  return { isValid, errors };
}

// Helper to calculate weighted average quality
function calculateWeightedQuality(tanks: Tank[]): TankQuality | null {
  const tanksWithQuality = tanks.filter(tank => tank.quality !== null);
  
  if (tanksWithQuality.length === 0) {
    return null;
  }

  const totalQuantity = tanksWithQuality.reduce((sum, tank) => sum + tank.quantity, 0);
  
  const weightedQuality: TankQuality = {
    FFA: 0,
    IV: 0,
    S: 0,
    MI: 0
  };

  tanksWithQuality.forEach(tank => {
    if (tank.quality) {
      const weight = tank.quantity / totalQuantity;
      weightedQuality.FFA += tank.quality.FFA * weight;
      weightedQuality.IV += tank.quality.IV * weight;
      weightedQuality.S += tank.quality.S * weight;
      weightedQuality.MI += tank.quality.MI * weight;
    }
  });

  return weightedQuality;
}

// Helper to update shipment quality
function updateShipmentQualityAfterTankChange(shipmentId: string): void {
  // Get updated quality from tanks
  const tanks = tankStore.getByShipmentId(shipmentId);
  const quality = calculateWeightedQuality(tanks);
  
  // Update shipment quality
  shipmentStore.updateQuality(shipmentId);
}

const STORAGE_KEY = 'tanks';

// Initialize storage if empty
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

initializeStorage();

export const tankStore = {
  getAll: (): Tank[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): Tank | undefined => {
    const tanks = tankStore.getAll();
    return tanks.find(tank => tank.id === id);
  },

  getByShipmentId: (shipmentId: string): Tank[] => {
    const tanks = tankStore.getAll();
    return tanks.filter(tank => tank.shipmentId === shipmentId);
  },

  create: (data: Omit<Tank, 'id' | 'createdAt' | 'updatedAt'>): Tank => {
    const tanks = tankStore.getAll();
    
    // Validate quality if provided
    if (data.quality) {
      const { isValid, errors } = validateQualityRanges(data.quality);
      if (!isValid) {
        throw new Error(`Invalid quality parameters: ${Object.values(errors).join(', ')}`);
      }
      
      // Get contract for quality validation
      const shipment = shipmentStore.getById(data.shipmentId);
      const contract = shipment ? contractsStore.getById(shipment.contractId) : null;
      
      if (contract) {
        const validation = validateQualityAgainstContract(data.quality, contract);
        
        // Only show warnings for contract spec violations, don't block creation
        if (Object.keys(validation.warnings).length > 0) {
          console.warn('Quality parameters outside contract specifications:', validation.warnings);
        }
      }
    }

    // Validate shipment exists and is active
    const shipment = shipmentStore.getById(data.shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    if (shipment.status === 'cancelled') {
      throw new Error('Cannot add tanks to cancelled shipment');
    }

    if (shipment.isFulfilled) {
      throw new Error('Cannot add tanks to fulfilled shipment');
    }

    // Validate quantity against remaining shipment quantity
    const existingTanks = tankStore.getByShipmentId(data.shipmentId);
    const totalTankQuantity = existingTanks.reduce((sum, tank) => sum + tank.quantity, 0);
    const remainingQuantity = shipment.quantity - totalTankQuantity;

    if (data.quantity > remainingQuantity) {
      throw new Error(`Tank quantity exceeds remaining shipment quantity (${remainingQuantity.toLocaleString()} MT)`);
    }

    // Validate dates are within shipment range
    const departureDate = new Date(data.departureDate);
    const arrivalDate = new Date(data.arrivalDate);
    const shipmentDepartureDate = new Date(shipment.departureDate);
    const shipmentArrivalDate = new Date(shipment.arrivalDate);

    if (departureDate < shipmentDepartureDate || arrivalDate > shipmentArrivalDate) {
      throw new Error('Tank dates must be within shipment date range');
    }

    if (arrivalDate < departureDate) {
      throw new Error('Arrival date must be after departure date');
    }

    // Generate ID
    const sequence = (existingTanks.length + 1).toString().padStart(3, '0');
    const newId = `${data.shipmentId}-TNK-${sequence}`;

    const newTank: Tank = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tanks.push(newTank);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tanks));

    // Update shipment quality
    updateShipmentQualityAfterTankChange(data.shipmentId);

    // Dispatch storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(tanks)
    }));

    return newTank;
  },

  update: (id: string, updates: Partial<Tank>): Tank => {
    const tanks = tankStore.getAll();
    
    // Validate quality if being updated
    if (updates.quality) {
      const { isValid, errors } = validateQuality(updates.quality);
      if (!isValid) {
        throw new Error(`Invalid quality parameters: ${Object.values(errors).join(', ')}`);
      }
    }

    const index = tanks.findIndex(tank => tank.id === id);
    
    if (index === -1) {
      throw new Error(`Tank with ID ${id} not found`);
    }

    const tank = tanks[index];
    const shipment = shipmentStore.getById(tank.shipmentId);

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Validate quantity if being updated
    if (updates.quantity !== undefined) {
      const otherTanks = tankStore.getByShipmentId(tank.shipmentId)
        .filter(t => t.id !== id);
      const totalOtherQuantity = otherTanks.reduce((sum, t) => sum + t.quantity, 0);
      const remainingQuantity = shipment.quantity - totalOtherQuantity;

      if (updates.quantity > remainingQuantity) {
        throw new Error(`Tank quantity exceeds remaining shipment quantity (${remainingQuantity.toLocaleString()} MT)`);
      }
    }

    // Validate dates if being updated
    if (updates.departureDate || updates.arrivalDate) {
      const departureDate = new Date(updates.departureDate || tank.departureDate);
      const arrivalDate = new Date(updates.arrivalDate || tank.arrivalDate);
      const shipmentDepartureDate = new Date(shipment.departureDate);
      const shipmentArrivalDate = new Date(shipment.arrivalDate);

      if (departureDate < shipmentDepartureDate || arrivalDate > shipmentArrivalDate) {
        throw new Error('Tank dates must be within shipment date range');
      }

      if (arrivalDate < departureDate) {
        throw new Error('Arrival date must be after departure date');
      }
    }

    const updatedTank = {
      ...tank,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    tanks[index] = updatedTank;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tanks));

    // Update shipment quality if quality changed
    if (updates.quality) {
      updateShipmentQualityAfterTankChange(updatedTank.shipmentId);
    }

    // Dispatch storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(tanks)
    }));

    return updatedTank;
  },

  delete: (id: string): void => {
    const tanks = tankStore.getAll();
    const tank = tanks.find(t => t.id === id);
    if (!tank) return;

    // Get shipment ID before deletion
    const shipmentId = tank.shipmentId;

    // Validate tank can be deleted
    const shipment = shipmentStore.getById(shipmentId);
    if (shipment?.isFulfilled) {
      throw new Error('Cannot delete tank from fulfilled shipment');
    }

    const filteredTanks = tanks.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTanks));

    // Update shipment quality after tank deletion
    updateShipmentQualityAfterTankChange(shipmentId);

    // Dispatch storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(filteredTanks)
    }));
  },

  // Get weighted average quality for a shipment's tanks
  getShipmentQuality: (shipmentId: string): TankQuality | null => {
    const tanks = tankStore.getByShipmentId(shipmentId);
    return calculateWeightedQuality(tanks);
  }
};