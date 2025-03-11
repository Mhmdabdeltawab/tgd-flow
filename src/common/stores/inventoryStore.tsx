import { Terminal, StorageTank, Warehouse } from '../types/inventory';

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
    operatorId: 'SUP001',
    operatorName: 'Supplier 1 GmbH',
    capacity: 25000,
    wasteTypes: ['UCO', 'PFAD'],
    quantity: 8000,
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
    operatorId: 'SUP001',
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
    
    const newTerminal: Terminal = {
      ...data,
      id: `TRM${(terminals.length + 1).toString().padStart(3, '0')}`,
      storageTankCount: 0,
      totalQuantity: 0,
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

    const updatedTerminal = {
      ...terminals[index],
      ...updates,
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
    return tanks.find(t => t.id === id);
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
      quantity: 0,
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
    
    const newWarehouse: Warehouse = {
      ...data,
      id: `WRH${(warehouses.length + 1).toString().padStart(3, '0')}`,
      quantity: 0,
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