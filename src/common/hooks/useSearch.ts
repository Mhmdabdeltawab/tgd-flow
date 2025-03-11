import { useState, useCallback, useMemo } from 'react';

export function useSearch<T extends Record<string, any>>(
  data: T[],
  searchFields?: (keyof T)[]
) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const searchedData = useMemo(() => {
    if (!searchQuery) return data;

    const query = searchQuery.toLowerCase();
    return data.filter(item => {
      const fieldsToSearch = searchFields || Object.keys(item);
      return fieldsToSearch.some(field => {
        const value = item[field];
        return value?.toString().toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchFields]);

  return {
    searchQuery,
    setSearchQuery: handleSearch,
    searchedData,
  };
}