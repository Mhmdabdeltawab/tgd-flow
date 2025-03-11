import { Party, PartyType } from '../types/party';

const STORAGE_KEYS = {
  suppliers: 'suppliers',
  buyers: 'buyers'
};

// Sample data
const sampleSuppliers: Party[] = [
  {
    id: 'SUP001',
    name: 'Supplier 1 GmbH',
    country: 'United States',
    countryCode: 'US',
    accountManager: 'Michael Brown',
    email: 'manager1@supplier1.com',
    phone: '+33 925-993-5881',
    isccNumber: 'EU-ISCC-535089',
    isccExpiry: '2027-02-04',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SUP002',
    name: 'Supplier 2 Corp',
    country: 'Japan',
    countryCode: 'JP',
    accountManager: 'Sarah Davis',
    email: 'manager2@supplier2.com',
    phone: '+1 925-798-3072',
    isccNumber: 'EU-ISCC-662152',
    isccExpiry: '2027-02-04',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const sampleBuyers: Party[] = [
  {
    id: 'BUY001',
    name: 'Buyer 1 Corp',
    country: 'United States',
    countryCode: 'US',
    accountManager: 'John Smith',
    email: 'manager1@buyer1.com',
    phone: '+1 555-123-4567',
    isccNumber: 'EU-ISCC-789012',
    isccExpiry: '2027-02-04',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initialize storage with sample data
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.suppliers)) {
    localStorage.setItem(STORAGE_KEYS.suppliers, JSON.stringify(sampleSuppliers));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.buyers)) {
    localStorage.setItem(STORAGE_KEYS.buyers, JSON.stringify(sampleBuyers));
  }
}

// Ensure initialization runs immediately
initializeStorage();

export const partyStore = {
  getAll: (type: PartyType): Party[] => {
    const data = localStorage.getItem(STORAGE_KEYS[type]);
    return data ? JSON.parse(data) : [];
  },

  getById: (type: PartyType, id: string): Party | undefined => {
    const parties = partyStore.getAll(type);
    // Handle both old and new ID formats
    return parties.find(party => {
      const oldId = id.replace('SUPPLIER', 'SUP').replace('BUYER', 'BUY');
      const newId = id.replace('SUP', 'SUPPLIER').replace('BUY', 'BUYER');
      return party.id === id || party.id === oldId || party.id === newId;
    });
  },

  create: (type: PartyType, partyData: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>): Party => {
    const parties = partyStore.getAll(type);
    
    // Use longer, more distinct prefixes
    const prefix = type === 'suppliers' ? 'SUPPLIER' : 'BUYER';
    const sequence = (parties.length + 1).toString().padStart(3, '0');
    const newId = `${prefix}${sequence}`;

    const newParty: Party = {
      ...partyData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    parties.push(newParty);
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(parties));
    return newParty;
  },

  update: (type: PartyType, id: string, updates: Partial<Party>): Party => {
    const parties = partyStore.getAll(type);
    const index = parties.findIndex(party => party.id === id);
    
    if (index === -1) {
      throw new Error(`${type} with ID ${id} not found`);
    }

    const updatedParty = {
      ...parties[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    parties[index] = updatedParty;
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(parties));
    return updatedParty;
  },

  delete: (type: PartyType, id: string): void => {
    const parties = partyStore.getAll(type);
    const filteredParties = parties.filter(party => party.id !== id);
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(filteredParties));
  }
};