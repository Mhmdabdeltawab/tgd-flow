import { useState, useCallback, useMemo } from 'react';

export interface FilterGroup<T> {
  id: string;
  title: string;
  items: T[];
  selectedItems: T[];
  onSelect: (item: T) => void;
}

export interface FilterState {
  [key: string]: string[];
}

export function useFilters<T extends Record<string, any>>(
  data: T[],
  initialFilters: FilterState = {}
) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const toggleFilter = useCallback((groupId: string, value: string) => {
    setFilters(prev => {
      const currentGroup = prev[groupId] || [];
      const newGroup = currentGroup.includes(value)
        ? currentGroup.filter(item => item !== value)
        : [...currentGroup, value];

      return {
        ...prev,
        [groupId]: newGroup,
      };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).reduce(
      (count, group) => count + group.length,
      0
    );
  }, [filters]);

  const createFilterGroup = useCallback(
    (groupId: string, title: string, items: string[]): FilterGroup<string> => ({
      id: groupId,
      title,
      items,
      selectedItems: filters[groupId] || [],
      onSelect: (item: string) => toggleFilter(groupId, item),
    }),
    [filters, toggleFilter]
  );

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([field, values]) => {
        if (values.length === 0) return true;
        return values.includes(String(item[field]));
      });
    });
  }, [data, filters]);

  return {
    filters,
    activeFiltersCount,
    toggleFilter,
    clearFilters,
    createFilterGroup,
    filteredData,
  };
}