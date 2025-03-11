import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import Button from '../Button/Button';
import Search from '../Search/Search';
import FiltersButton from '../Filters/FiltersButton';

interface TableToolbarAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

interface TableToolbarMainAction extends TableToolbarAction {
  badge?: number;
}

interface TableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onEditColumns: () => void;
  onOpenFilters: () => void;
  activeFilters?: number;
  searchPlaceholder?: string;
  mainAction?: TableToolbarMainAction;
  customActions?: React.ReactNode;
  secondaryActions?: TableToolbarAction[];
}

export default function TableToolbar({
  searchValue,
  onSearchChange,
  onEditColumns,
  onOpenFilters,
  activeFilters = 0,
  searchPlaceholder,
  mainAction,
  customActions,
  secondaryActions = [],
}: TableToolbarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
      <div className="px-6 py-4">
        {/* Search and Filters Row */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Search
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          </div>
          {mainAction && (
            <Button
              icon={mainAction.icon}
              variant={mainAction.variant || 'secondary'}
              onClick={mainAction.onClick}
              className={mainAction.className}
            >
              <span className="flex items-center gap-2">
                {mainAction.label}
                {mainAction.badge !== undefined && (
                  <span className="flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-opacity-20">
                    {mainAction.badge}
                  </span>
                )}
              </span>
            </Button>
          )}
          <FiltersButton
            onClick={onOpenFilters}
            activeFilters={activeFilters}
          />
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          {/* Left side actions */}
          <div className="flex items-center gap-2">
            {/* Visible Secondary Actions */}
            {secondaryActions.map((action, index) => (
              <Button
                key={index}
                icon={action.icon}
                variant={action.variant || 'ghost'}
                onClick={action.onClick}
                className={`px-3 py-2 ${action.className || ''}`}
              >
                {action.label}
              </Button>
            ))}

            {customActions}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onEditColumns}
              icon={SlidersHorizontal}
              variant="secondary"
              className="px-4 py-2"
            >
              Columns
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}