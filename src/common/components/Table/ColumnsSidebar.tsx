import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import SidePanel from '../SidePanel/SidePanel';
import Button from '../Button/Button';

export interface Column {
  key: string;
  header: string;
  width?: string;
  isVisible?: boolean;
}

interface ColumnsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
}

export default function ColumnsSidebar({
  isOpen,
  onClose,
  columns,
  onColumnsChange,
}: ColumnsSidebarProps) {
  // Toggle column visibility
  const toggleColumn = (columnKey: string) => {
    onColumnsChange(
      columns.map(col =>
        col.key === columnKey ? { ...col, isVisible: !col.isVisible } : col
      )
    );
  };

  // Reset all columns to visible
  const resetColumns = () => {
    onColumnsChange(columns.map(col => ({ ...col, isVisible: true })));
  };

  // Hide all columns except ID (prevent empty table)
  const hideAllColumns = () => {
    onColumnsChange(
      columns.map(col => ({
        ...col,
        isVisible: col.key === 'id' ? true : false,
      }))
    );
  };

  // Show all columns
  const showAllColumns = () => {
    onColumnsChange(columns.map(col => ({ ...col, isVisible: true })));
  };

  // Count visible columns
  const visibleCount = columns.filter(col => col.isVisible !== false).length;

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Table Columns"
      description="Customize which columns are visible in the table"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button onClick={resetColumns}>Reset to default</Button>
          <Button variant="primary" onClick={onClose}>
            Apply changes
          </Button>
        </div>
      }
    >
      <div className="p-4">
        {/* Bulk actions */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <span className="text-sm text-gray-500">
            {visibleCount} of {columns.length} columns visible
          </span>
          <div className="flex items-center gap-2">
            <Button
              onClick={showAllColumns}
              icon={Eye}
              variant="secondary"
              className="text-xs"
            >
              Show all
            </Button>
            <Button
              onClick={hideAllColumns}
              icon={EyeOff}
              variant="secondary"
              className="text-xs"
            >
              Hide all
            </Button>
          </div>
        </div>

        {/* Column list */}
        <div className="space-y-1">
          {columns.map((column) => {
            const isVisible = column.isVisible !== false;
            const isLocked = column.key === 'id';

            return (
              <div
                key={column.key}
                className={`
                  flex items-center justify-between p-2 rounded-lg
                  ${isLocked ? 'bg-gray-50' : 'hover:bg-gray-50'}
                  ${isVisible ? '' : 'opacity-60'}
                `}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => !isLocked && toggleColumn(column.key)}
                    disabled={isLocked}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {column.header}
                  </span>
                </div>
                {isLocked && (
                  <span className="text-xs text-gray-400">Required</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </SidePanel>
  );
}