import { useState, useEffect } from 'react';
import { Column } from '../components/Table/ColumnsSidebar';

// Key for storing column preferences in localStorage
const getStorageKey = (pageId: string) => `table-columns-${pageId}`;

export function useColumns(pageId: string, defaultColumns: Column[]) {
  // Initialize state with stored preferences or default columns
  const [columns, setColumns] = useState<Column[]>(() => {
    const stored = localStorage.getItem(getStorageKey(pageId));
    if (stored) {
      const storedColumns = JSON.parse(stored);
      // Merge with default columns to handle added/removed columns
      return defaultColumns.map(col => ({
        ...col,
        isVisible: storedColumns.find((c: Column) => c.key === col.key)?.isVisible ?? true
      }));
    }
    return defaultColumns;
  });

  // Persist column changes to localStorage
  useEffect(() => {
    localStorage.setItem(getStorageKey(pageId), JSON.stringify(columns));
  }, [columns, pageId]);

  // Get only visible columns
  const visibleColumns = columns.filter(col => col.isVisible !== false);

  return {
    columns,
    setColumns,
    visibleColumns
  };
}