import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { errorService } from '../services/errorService';

export interface BaseState<T> {
  items: T[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: string | null;
}

export interface BaseActions<T> {
  setItems: (items: T[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  clearError: () => void;
}

export const createBaseStore = <T extends { id: string }>(key: string) => {
  // Create store with selector middleware for optimized updates
  return create(
    subscribeWithSelector<BaseState<T> & BaseActions<T>>((set, get) => ({
      // Initial state
      items: [],
      isLoading: false,
      error: null,
      lastUpdated: null,

      // Actions
      setItems: (items) => {
        try {
          // Save to localStorage
          localStorage.setItem(key, JSON.stringify(items));
          
          // Update state
          set({
            items,
            lastUpdated: new Date().toISOString(),
            error: null
          });

          // Dispatch storage event for cross-tab sync
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(items)
          }));
        } catch (error) {
          errorService.handleError(error);
          set({ error: error as Error });
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null })
    }))
  );
};