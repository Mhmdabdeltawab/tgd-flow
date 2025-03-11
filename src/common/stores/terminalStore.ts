// Singleton store for terminals data
const STORAGE_KEY = 'terminals';

// Sample data
const sampleTerminals = [
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
  },
  {
    id: 'TRM002',
    name: 'Hamburg Terminal Beta',
    country: 'Germany',
    port: 'Hamburg',
    wasteTypes: ['UCO', 'PFAD'],
    capacity: 35000,
    storageTankCount: 1,
    totalQuantity: 10000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initialize storage
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTerminals));
  }
};

// Ensure initialization runs immediately
initializeStorage();

export const terminalStore = {
  getAll: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string) => {
    const terminals = terminalStore.getAll();
    return terminals.find(t => t.id === id);
  },

  getByPort: (port: string) => {
    const terminals = terminalStore.getAll();
    return terminals.filter(t => t.port === port);
  },

  getByCountry: (country: string) => {
    const terminals = terminalStore.getAll();
    return terminals.filter(t => t.country === country);
  }
};