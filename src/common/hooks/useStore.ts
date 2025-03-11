import { useEffect, useCallback } from 'react';
import { errorService } from '../services/errorService';

interface UseStoreConfig<T> {
  store: {
    items: T[];
    isLoading: boolean;
    error: Error | null;
    setItems: (items: T[]) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: Error | null) => void;
  };
  storageKey: string;
  onError?: (error: Error) => void;
}

export function useStore<T>({ store, storageKey, onError }: UseStoreConfig<T>) {
  // Load initial data
  useEffect(() => {
    const loadData = () => {
      try {
        store.setLoading(true);
        const data = localStorage.getItem(storageKey);
        if (data) {
          store.setItems(JSON.parse(data));
        }
      } catch (error) {
        const err = error as Error;
        store.setError(err);
        onError?.(err);
        errorService.handleError(error);
      } finally {
        store.setLoading(false);
      }
    };

    loadData();
  }, [storageKey]);

  // Handle storage events for cross-tab sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          store.setItems(JSON.parse(e.newValue));
        } catch (error) {
          const err = error as Error;
          store.setError(err);
          onError?.(err);
          errorService.handleError(error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  // Error boundary integration
  const handleError = useCallback((error: Error) => {
    store.setError(error);
    onError?.(error);
    errorService.handleError(error);
  }, [onError]);

  return {
    handleError
  };
}