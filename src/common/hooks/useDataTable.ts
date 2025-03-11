import { useMemo } from 'react';
import { useSort } from './useSort';
import { useSearch } from './useSearch';
import { useFilters } from './useFilters';
import { useColumns } from './useColumns';
import { Column } from '../components/Table/ColumnsSidebar';

interface UseDataTableProps<T> {
  data: T[];
  defaultColumns: Column[];
  pageId: string;
  searchFields?: (keyof T)[];
  initialFilters?: Record<string, string[]>;
}

export function useDataTable<T extends Record<string, any>>({
  data,
  defaultColumns,
  pageId,
  searchFields,
  initialFilters,
}: UseDataTableProps<T>) {
  // Initialize all hooks
  const { columns, setColumns, visibleColumns } = useColumns(pageId, defaultColumns);
  const { searchQuery, setSearchQuery, searchedData } = useSearch(data, searchFields);
  const { filters, activeFiltersCount, toggleFilter, clearFilters, createFilterGroup, filteredData } = useFilters(searchedData, initialFilters);
  const { sortedData, sort, toggleSort } = useSort(filteredData);

  // Memoize the final processed data
  const processedData = useMemo(() => sortedData, [sortedData]);

  return {
    // Data
    data: processedData,
    
    // Columns
    columns,
    setColumns,
    visibleColumns,
    
    // Search
    searchQuery,
    setSearchQuery,
    
    // Filters
    filters,
    activeFiltersCount,
    toggleFilter,
    clearFilters,
    createFilterGroup,
    
    // Sort
    sort,
    toggleSort,
  };
}