import { Contract, ContractType } from '../types/contract';

const STORAGE_KEY = 'contracts';

// Sample data
const sampleContracts: Contract[] = [
  {
    id: 'UCO-SUP-US-240209-001',
    type: 'Supply',
    status: 'opened',
    buyerId: 'BUY001',
    sellerId: 'SUP001',
    buyerName: 'Buyer 1 Corp',
    sellerName: 'Supplier 1 GmbH',
    productType: 'UCO',
    incoterm: 'FOB',
    quantity: '1000',
    allowedVariance: '5',
    unitPrice: '850',
    currency: 'USD',
    paymentTerms: 'CAD_90',
    qualityFFA: '5',
    qualityIV: '85',
    qualityS: '2',
    qualityM1: '1',
    packingStandard: 'ISO Standard',
    originCountry: 'United States',
    deliveryCountry: 'Germany',
    deliveryPort: 'Hamburg',
    loadingStartDate: '2024-03-15',
    deliveryDate: '2024-04-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initialize storage with sample data
const initializeStorage = () => {
  const existingData = localStorage.getItem(STORAGE_KEY);
  if (!existingData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleContracts));
  }
};

initializeStorage();

export const contractsStore = {
  getAll: (): Contract[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): Contract | undefined => {
    const contracts = contractsStore.getAll();
    return contracts.find(contract => contract.id === id);
  },

  create: (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Contract => {
    const contracts = contractsStore.getAll();
    
    // Generate a new ID
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0].replace(/-/g, '').substring(2);
    const sequence = (contracts.length + 1).toString().padStart(3, '0');
    const prefix = contractData.type === 'Supply' ? 'SUP' : 'SEL';
    const newId = `${contractData.productType}-${prefix}-US-${formattedDate}-${sequence}`;

    const newContract: Contract = {
      ...contractData,
      id: newId,
      status: 'opened',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    contracts.push(newContract);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
    return newContract;
  },

  update: (id: string, updates: Partial<Contract>): Contract => {
    const contracts = contractsStore.getAll();
    const index = contracts.findIndex(contract => contract.id === id);
    
    if (index === -1) {
      throw new Error(`Contract with ID ${id} not found`);
    }

    const updatedContract = {
      ...contracts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    contracts[index] = updatedContract;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
    return updatedContract;
  },

  delete: (id: string): void => {
    const contracts = contractsStore.getAll();
    const filteredContracts = contracts.filter(contract => contract.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredContracts));
  }
};