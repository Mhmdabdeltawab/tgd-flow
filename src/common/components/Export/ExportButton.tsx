import React from 'react';
import { FileDown } from 'lucide-react';
import Button from '../Button/Button';
import { ExportFormat } from '../../hooks/useExport';

interface ExportButtonProps {
  onExport: (options: { format: ExportFormat }) => void;
  isExporting?: boolean;
}

export default function ExportButton({ onExport, isExporting }: ExportButtonProps) {
  const [showDropdown, setShowDropdown] = React.useState(false);

  const exportFormats: { label: string; format: ExportFormat }[] = [
    { label: 'CSV', format: 'csv' },
    { label: 'Excel', format: 'excel' }
  ];

  return (
    <div className="relative">
      <Button
        icon={FileDown}
        variant="ghost"
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-3 py-2"
        disabled={isExporting}
      >
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute left-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200 py-1 z-30">
            {exportFormats.map(({ label, format }) => (
              <button
                key={format}
                onClick={() => {
                  onExport({ format });
                  setShowDropdown(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileDown className="w-4 h-4 mr-3" />
                Export as {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}