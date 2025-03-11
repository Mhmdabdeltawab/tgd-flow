import { Terminal, StorageTank, Warehouse } from '../types/inventory';
import { shipmentStore } from './shipmentStore';
import { contractsStore } from './contractsStore';

const STORAGE_KEYS = {
  terminals: 'terminals',
  storageTanks: 'storageTanks',
  warehouses: 'warehouses'
};

// Sample data
const sampleTerminals: Terminal[] = [
  {
    id: 'TRM001',
    name: 'Rotterdam Terminal Alpha',
    country: 'Netherlands',
    port: 'Rotterdam',
    wasteTypes: ['UCO', 'PFAD', 'Acid Oil'],
    capacity: 50000,
    storageTankCount: 2,
    totalQuantity: 15000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const sampleStorageTanks: StorageTank[] = [
  {
    id: 'TNK001',
    name: 'Tank A1',
    terminalId: 'TRM001',
    operatorId: 'SUPPLIER001',
    operatorName: 'Supplier 1 GmbH',
    capacity: 25000,
    wasteTypes: ['UCO', 'PFAD'],
    actualQuantity: 8000,
    expectedQuantity: 12000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const sampleWarehouses: Warehouse[] = [
  {
    id: 'WRH001',
    name: 'Warehouse 1',
    country: 'Netherlands',
    port: 'Rotterdam',
    operatorId: 'SUPPLIER001',
    operatorName: 'Supplier 1 GmbH',
    capacity: 10000,
    wasteTypes: ['UCO'],
    quantity: 3000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initialize storage
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.terminals)) {
    localStorage.setItem(STORAGE_KEYS.terminals, JSON.stringify(sampleTerminals));
  }
  if (!localStorage.getItem(STORAGE_KEYS.storageTanks)) {
    localStorage.setItem(STORAGE_KEYS.storageTanks, JSON.stringify(sampleStorageTanks));
  }
  if (!localStorage.getItem(STORAGE_KEYS.warehouses)) {
    localStorage.setItem(STORAGE_KEYS.warehouses, JSON.stringify(sampleWarehouses));
  }
};

initializeStorage();

// Calculate storage tank actual quantity (only received shipments)
function calculateStorageTankActualQuantity(tankId: string): number {
  const tank = inventoryStore.getStorageTankById(tankId);
  if (!tank) return 0;
  
  const shipments = shipmentStore.getAll();
  
  // Get all received shipments for this tank's operator at this terminal
  const receivedShipments = shipments.filter(shipment => {
    return shipment.status === 'received' && 
           shipment.terminal === tank.name;
  });
  
  // Sum quantities from received shipments
  return receivedShipments.reduce((sum, shipment) => sum + shipment.quantity, 0);
}

// Calculate storage tank expected quantity (all non-cancelled, non-received shipments)
function calculateStorageTankExpectedQuantity(tankId: string): number {
  const tank = inventoryStore.getStorageTankById(tankId);
  if (!tank) return 0;
  
  const shipments = shipmentStore.getAll();
  
  // Get all active shipments assigned to this tank's operator at this terminal
  return shipments.reduce((total, shipment) => {
    if (shipment.terminal === tank.name && 
        shipment.status !== 'cancelled' && 
        shipment.status !== 'received') {
      return total + shipment.quantity;
    }
    return total;
  }, 0);
}

// Update storage tank quantities
function updateStorageTankQuantities(tankId: string): void {
  const tanks = inventoryStore.getAllStorageTanks();
  const index = tanks.findIndex(t => t.id === tankId);
  
  if (index === -1) return;
  
  tanks[index] = {
    ...tanks[index],
    actualQuantity: calculateStorageTankActualQuantity(tankId),
    expectedQuantity: calculateStorageTankExpectedQuantity(tankId),
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEYS.storageTanks, JSON.stringify(tanks));
}

// Calculate warehouse quantity based on shipments
function calculateWarehouseQuantity(operatorId: string): number {
  const shipments = shipmentStore.getAll();
  const contracts = contractsStore.getAll();
  
  // Get all possible ID formats for matching
  const possibleIds = [
    operatorId,
    operatorId.replace('SUPPLIER', 'SUP'),
    operatorId.replace('SUP', 'SUPPLIER'),
    operatorId.replace('BUYER', 'BUY'),
    operatorId.replace('BUY', 'BUYER')
  ];
  
  // Get all supply contracts where this operator is the seller
  const supplyContracts = contracts.filter(contract => 
    contract.type === 'Supply' && 
    possibleIds.includes(contract.sellerId) &&
    contract.status === 'opened'
  );

  console.log('Operator ID:', operatorId);
  console.log('Possible IDs:', possibleIds);
  console.log('Found contracts:', supplyContracts);

  // Sum quantities from supply contracts
  return supplyContracts.reduce((total, contract) => {
    return total + Number(contract.quantity);
  }, 0);
}

// Calculate terminal actual quantity (only received shipments)
function calculateTerminalActualQuantity(terminalId: string): number {
  const terminal = inventoryStore.getTerminalById(terminalId);
  if (!terminal) return 0;
  
  const shipments = shipmentStore.getAll();
  
  // Get all received shipments for this terminal
  const receivedShipments = shipments.filter(shipment => 
    shipment.status === 'received' && 
    shipment.terminal === terminal.name
  );
  
  // Sum quantities from received shipments
  return receivedShipments.reduce((sum, shipment) => sum + shipment.quantity, 0);
}

// Calculate terminal expected quantity (all non-cancelled, non-received shipments)
function calculateTerminalExpectedQuantity(terminalId: string): number {
  const terminal = inventoryStore.getTerminalById(terminalId);
  if (!terminal) return 0;
  
  const shipments = shipmentStore.getAll();
  
  // Get all active shipments assigned to this terminal
  const activeShipments = shipments.filter(shipment =>
    shipment.terminal === terminal.name &&
    shipment.status !== 'cancelled' &&
    shipment.status !== 'received'
  );
  
  // Sum quantities from active shipments
  return activeShipments.reduce((sum, shipment) => sum + shipment.quantity, 0);
}

// Update terminal quantities
function updateTerminalQuantities(terminalId: string): void {
  const terminals = inventoryStore.getAllTerminals();
  const index = terminals.findIndex(t => t.id === terminalId);
  
  if (index === -1) return;
  
  const actualQuantity = calculateTerminalActualQuantity(terminalId);
  const expectedQuantity = calculateTerminalExpectedQuantity(terminalId);
  
  terminals[index] = {
    ...terminals[index],
    actualQuantity,
    expectedQuantity,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEYS.terminals, JSON.stringify(terminals));
  
  // Dispatch storage event for cross-tab sync
  window.dispatchEvent(new StorageEvent('storage', {
    key: STORAGE_KEYS.terminals,
    newValue: JSON.stringify(terminals)
  }));
}

// Subscribe to shipment changes to update warehouse quantities
window.addEventListener('storage', (e) => {
  if (e.key === 'shipments') {
    updateAllWarehouseQuantities();
  }
});

export const inventoryStore = {
  // Terminals
  getAllTerminals: (): Terminal[] => {
    const data = localStorage.getItem(STORAGE_KEYS.terminals);
    return data ? JSON.parse(data) : [];
  },

  getTerminalById: (id: string): Terminal | undefined => {
    const terminals = inventoryStore.getAllTerminals();
    return terminals.find(t => t.id === id);
  },

  createTerminal: (data: Omit<Terminal, 'id' | 'storageTankCount' | 'totalQuantity' | 'createdAt' | 'updatedAt'>): Terminal => {
    const terminals = inventoryStore.getAllTerminals();
    
    // Calculate initial quantities
    const actualQuantity = 0;
    const expectedQuantity = calculateTerminalExpectedQuantity(data.id);
    
    const newTerminal: Terminal = {
      ...data,
      id: `TRM${(terminals.length + 1).toString().padStart(3, '0')}`,
      storageTankCount: 0,
      actualQuantity,
      expectedQuantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    terminals.push(newTerminal);
    localStorage.setItem(STORAGE_KEYS.terminals, JSON.stringify(terminals));
    return newTerminal;
  },

  updateTerminal: (id: string, updates: Partial<Terminal>): Terminal => {
    const terminals = inventoryStore.getAllTerminals();
    const index = terminals.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error(`Terminal with ID ${id} not found`);
    }
    
    // Recalculate quantities
    const actualQuantity = calculateTerminalActualQuantity(id);
    const expectedQuantity = calculateTerminalExpectedQuantity(id);

    const updatedTerminal = {
      ...terminals[index],
      ...updates,
      actualQuantity,
      expectedQuantity,
      updatedAt: new Date().toISOString()
    };

    terminals[index] = updatedTerminal;
    localStorage.setItem(STORAGE_KEYS.terminals, JSON.stringify(terminals));
    return updatedTerminal;
  },

  deleteTerminal: (id: string): void => {
    const terminals = inventoryStore.getAllTerminals();
    const storageTanks = inventoryStore.getAllStorageTanks();
    
    // Delete all storage tanks associated with this terminal
    const updatedStorageTanks = storageTanks.filter(tank => tank.terminalId !== id);
    localStorage.setItem(STORAGE_KEYS.storageTanks, JSON.stringify(updatedStorageTanks));
    
    // Delete terminal
    const filteredTerminals = terminals.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.terminals, JSON.stringify(filteredTerminals));
  },

  // Storage Tanks
  getAllStorageTanks: (): StorageTank[] => {
    const data = localStorage.getItem(STORAGE_KEYS.storageTanks);
    return data ? JSON.parse(data) : [];
  },

  getStorageTankById: (id: string): StorageTank | undefined => {
    const tanks = inventoryStore.getAllStorageTanks();
    return tanks.find(tank => {
      if (tank.id === id) {
        // Convert operator ID to new format
        tank.operatorId = tank.operatorId
          .replace('SUP', 'SUPPLIER')
          .replace('BUY', 'BUYER');
        return true;
      }
      return false;
    });
  },

  getStorageTanksByTerminal: (terminalId: string): StorageTank[] => {
    const tanks = inventoryStore.getAllStorageTanks();
    return tanks.filter(t => t.terminalId === terminalId);
  },

  createStorageTank: (data: Omit<StorageTank, 'id' | 'quantity' | 'createdAt' | 'updatedAt'>): StorageTank => {
    const tanks = inventoryStore.getAllStorageTanks();
    const terminal = inventoryStore.getTerminalById(data.terminalId);
    
    if (!terminal) {
      throw new Error('Terminal not found');
    }

    if (!terminal.capacity) {
      throw new Error('Terminal must have capacity set before adding storage tanks');
    }

    const newTank: StorageTank = {
      ...data,
      id: `TNK${(tanks.length + 1).toString().padStart(3, '0')}`,
      actualQuantity: 0,
      expectedQuantity: calculateStorageTankExpectedQuantity(data.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tanks.push(newTank);
    localStorage.setItem(STORAGE_KEYS.storageTanks, JSON.stringify(tanks));

    // Update terminal's storage tank count
    terminal.storageTankCount = inventoryStore.getStorageTanksByTerminal(terminal.id).length + 1;
    inventoryStore.updateTerminal(terminal.id, { storageTankCount: terminal.storageTankCount });

    return newTank;
  },

  updateStorageTank: (id: string, updates: Partial<StorageTank>): StorageTank => {
    const tanks = inventoryStore.getAllStorageTanks();
    const index = tanks.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error(`Storage tank with ID ${id} not found`);
    }

    const updatedTank = {
      ...tanks[index],
      ...updates,
      actualQuantity: calculateStorageTankActualQuantity(id),
      expectedQuantity: calculateStorageTankExpectedQuantity(id),
      updatedAt: new Date().toISOString()
    };

    tanks[index] = updatedTank;
    localStorage.setItem(STORAGE_KEYS.storageTanks, JSON.stringify(tanks));
    return updatedTank;
  },

  deleteStorageTank: (id: string): void => {
    const tanks = inventoryStore.getAllStorageTanks();
    const tank = tanks.find(t => t.id === id);
    
    if (tank) {
      // Update terminal's storage tank count
      const terminal = inventoryStore.getTerminalById(tank.terminalId);
      if (terminal) {
        terminal.storageTankCount = Math.max(0, terminal.storageTankCount - 1);
        inventoryStore.updateTerminal(terminal.id, { storageTankCount: terminal.storageTankCount });
      }
    }

    const filteredTanks = tanks.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.storageTanks, JSON.stringify(filteredTanks));
  },

  // Warehouses
  getAllWarehouses: (): Warehouse[] => {
    const data = localStorage.getItem(STORAGE_KEYS.warehouses);
    return data ? JSON.parse(data) : [];
  },

  getWarehouseById: (id: string): Warehouse | undefined => {
    const warehouses = inventoryStore.getAllWarehouses();
    return warehouses.find(w => w.id === id);
  },

  createWarehouse: (data: Omit<Warehouse, 'id' | 'quantity' | 'createdAt' | 'updatedAt'>): Warehouse => {
    const warehouses = inventoryStore.getAllWarehouses();
    
    // Calculate initial quantity based on active shipments
    const quantity = calculateWarehouseQuantity(data.operatorId);

    const newWarehouse: Warehouse = {
      ...data,
      id: `WRH${(warehouses.length + 1).toString().padStart(3, '0')}`,
      quantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    warehouses.push(newWarehouse);
    localStorage.setItem(STORAGE_KEYS.warehouses, JSON.stringify(warehouses));
    return newWarehouse;
  },

  updateWarehouse: (id: string, updates: Partial<Warehouse>): Warehouse => {
    const warehouses = inventoryStore.getAllWarehouses();
    const index = warehouses.findIndex(w => w.id === id);
    
    if (index === -1) {
      throw new Error(`Warehouse with ID ${id} not found`);
    }

    // Recalculate quantity if operator changes
    if (updates.operatorId && updates.operatorId !== warehouses[index].operatorId) {
      updates.quantity = calculateWarehouseQuantity(updates.operatorId);
    }

    const updatedWarehouse = {
      ...warehouses[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    warehouses[index] = updatedWarehouse;
    localStorage.setItem(STORAGE_KEYS.warehouses, JSON.stringify(warehouses));
    return updatedWarehouse;
  },

  deleteWarehouse: (id: string): void => {
    const warehouses = inventoryStore.getAllWarehouses();
    const filteredWarehouses = warehouses.filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.warehouses, JSON.stringify(filteredWarehouses));
  }
};