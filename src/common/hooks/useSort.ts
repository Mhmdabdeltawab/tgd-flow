import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: string | null;
  direction: SortDirection;
}

export function useSort<T>(data: T[]) {
  const [sort, setSort] = useState<SortState>({
    column: null,
    direction: null,
  });

  const sortedData = useMemo(() => {
    if (!sort.column || !sort.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sort.column!];
      const bValue = (b as any)[sort.column!];

      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sort.direction === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number') {
        return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [data, sort.column, sort.direction]);

  const toggleSort = (column: string) => {
    setSort(prev => ({
      column,
      direction:
        prev.column === column
          ? prev.direction === 'asc'
            ? 'desc'
            : prev.direction === 'desc'
            ? null
            : 'asc'
          : 'asc',
    }));
  };

  return {
    sortedData,
    sort,
    toggleSort,
  };
}