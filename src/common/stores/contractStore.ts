import { createBaseStore } from './baseStore';
import { Contract, ContractType } from '../types/contract';
import { errorService } from '../services/errorService';

interface ContractState {
  // Base state is included automatically
  selectedContract: Contract | null;
  filters: {
    type?: ContractType;
    status?: string[];
    productType?: string[];
  };
}

interface ContractActions {
  // CRUD operations
  create: (data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Contract>;
  update: (id: string, updates: Partial<Contract>) => Promise<Contract>;
  delete: (id: string) => Promise<void>;
  
  // Selection
  selectContract: (id: string | null) => void;
  
  // Filters
  setFilters: (filters: ContractState['filters']) => void;
  clearFilters: () => void;
}

// Create store with base functionality
const useContractStore = createBaseStore<Contract>('contracts');

// Add contract-specific functionality
export const useContracts = () => {
  const store = useContractStore();

  const create = async (data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
      store.setLoading(true);
      store.clearError();

      // Generate ID
      const date = new Date();
      const formattedDate = date.toISOString().split('T')[0].replace(/-/g, '').substring(2);
      const sequence = (store.items.length + 1).toString().padStart(3, '0');
      const prefix = data.type === 'Supply' ? 'SUP' : 'SEL';
      const newId = `${data.productType}-${prefix}-US-${formattedDate}-${sequence}`;

      const newContract: Contract = {
        ...data,
        id: newId,
        status: 'opened',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Update store
      store.setItems([...store.items, newContract]);
      return newContract;
    } catch (error) {
      errorService.handleError(error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  const update = async (id: string, updates: Partial<Contract>) => {
    try {
      store.setLoading(true);
      store.clearError();

      const index = store.items.findIndex(contract => contract.id === id);
      if (index === -1) {
        throw new Error(`Contract with ID ${id} not found`);
      }

      const updatedContract = {
        ...store.items[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const newItems = [...store.items];
      newItems[index] = updatedContract;
      store.setItems(newItems);

      return updatedContract;
    } catch (error) {
      errorService.handleError(error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  const remove = async (id: string) => {
    try {
      store.setLoading(true);
      store.clearError();

      const newItems = store.items.filter(contract => contract.id !== id);
      store.setItems(newItems);
    } catch (error) {
      errorService.handleError(error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  return {
    ...store,
    create,
    update,
    delete: remove
  };
};