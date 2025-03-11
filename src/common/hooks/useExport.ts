import { useState } from 'react';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

interface ExportOptions {
  filename?: string;
  format?: ExportFormat;
  columns?: string[];
}

export function useExport<T extends Record<string, any>>(data: T[]) {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async ({ filename = 'export', format = 'csv', columns }: ExportOptions = {}) => {
    setIsExporting(true);
    try {
      // Filter data to only include specified columns
      const exportData = data.map(item => {
        if (!columns) return item;
        return columns.reduce((acc, col) => ({
          ...acc,
          [col]: item[col]
        }), {});
      });

      // Convert data to CSV string
      const csvContent = convertToCSV(exportData);

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportData,
    isExporting
  };
}

// Helper function to convert data to CSV
function convertToCSV(data: Record<string, any>[]) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = [
    headers.join(','),
    ...data.map(item =>
      headers.map(header => {
        const value = item[header];
        // Handle special cases (objects, arrays, etc.)
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // Escape quotes and handle strings with commas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  return rows;
}