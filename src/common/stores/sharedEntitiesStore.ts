interface ShippingLine {
  id: string;
  name: string;
  country: string;
}

interface Terminal {
  id: string;
  name: string;
  country: string;
  port: string;
}

const STORAGE_KEYS = {
  shippingLines: 'shippingLines',
  terminals: 'terminals'
};

// Sample data
const sampleShippingLines: ShippingLine[] = [
  {
    id: 'SL001',
    name: 'Pacific Star',
    country: 'Singapore'
  },
  {
    id: 'SL002',
    name: 'Maersk Line',
    country: 'Denmark'
  },
  {
    id: 'SL003',
    name: 'MSC',
    country: 'Switzerland'
  },
  {
    id: 'SL004',
    name: 'CMA CGM',
    country: 'France'
  }
];

const sampleTerminals: Terminal[] = [
  {
    id: 'TRM001',
    name: 'Rotterdam Terminal Alpha',
    country: 'Netherlands',
    port: 'Rotterdam'
  },
  {
    id: 'TRM002',
    name: 'Hamburg Terminal Beta',
    country: 'Germany',
    port: 'Hamburg'
  },
  {
    id: 'TRM003',
    name: 'Antwerp Terminal Gamma',
    country: 'Belgium',
    port: 'Antwerp'
  }
];

// Initialize storage
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.shippingLines)) {
    localStorage.setItem(STORAGE_KEYS.shippingLines, JSON.stringify(sampleShippingLines));
  }
  if (!localStorage.getItem(STORAGE_KEYS.terminals)) {
    localStorage.setItem(STORAGE_KEYS.terminals, JSON.stringify(sampleTerminals));
  }
};

initializeStorage();

export const sharedEntitiesStore = {
  // Shipping Lines
  getAllShippingLines: (): ShippingLine[] => {
    const data = localStorage.getItem(STORAGE_KEYS.shippingLines);
    return data ? JSON.parse(data) : [];
  },

  getShippingLineById: (id: string): ShippingLine | undefined => {
    const shippingLines = sharedEntitiesStore.getAllShippingLines();
    return shippingLines.find(sl => sl.id === id);
  },

  // Terminals
  getAllTerminals: (): Terminal[] => {
    const data = localStorage.getItem(STORAGE_KEYS.terminals);
    return data ? JSON.parse(data) : [];
  },

  getTerminalById: (id: string): Terminal | undefined => {
    const terminals = sharedEntitiesStore.getAllTerminals();
    return terminals.find(t => t.id === t.id);
  },

  getTerminalsByCountry: (country: string): Terminal[] => {
    const terminals = sharedEntitiesStore.getAllTerminals();
    return terminals.filter(t => t.country === country);
  }
};

export type { ShippingLine, Terminal };