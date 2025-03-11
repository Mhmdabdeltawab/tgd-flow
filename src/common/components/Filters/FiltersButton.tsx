import React from 'react';
import { Filter } from 'lucide-react';

interface FiltersButtonProps {
  onClick: () => void;
  activeFilters?: number;
}

export default function FiltersButton({ onClick, activeFilters = 0 }: FiltersButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 h-11 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
    >
      <Filter className="w-4 h-4" />
      Filters
      {activeFilters > 0 && (
        <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-gray-900 rounded-full ml-1">
          {activeFilters}
        </span>
      )}
    </button>
  );
}