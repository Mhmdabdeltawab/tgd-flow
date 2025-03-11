import { useState, useCallback } from 'react';
import { useToast } from './useToast';
import {
  ImportConfig,
  parseImportFile,
  validateAndMapData,
  generateImportTemplate,
  IMPORT_CONFIGS
} from '../utils/importUtils';

interface ImportProgress {
  total: number;
  current: number;
  successful: number;
  warnings: number;
  failed: number;
}

export function useImport(type: keyof typeof IMPORT_CONFIGS, onSave: (data: any) => Promise<void>) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const toast = useToast();

  const importData = useCallback(async (file: File) => {
    setIsImporting(true);
    setProgress({ total: 0, current: 0, successful: 0, warnings: 0, failed: 0 });

    try {
      // Parse file
      const rows = await parseImportFile(file);
      const [headers, ...dataRows] = rows;

      // Update total
      setProgress(prev => prev ? { ...prev, total: dataRows.length } : null);

      // Process each row
      const results = [];
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        if (row.length < headers.length) continue;

        // Validate and map data
        const result = validateAndMapData(row, headers, IMPORT_CONFIGS[type]);

        // Save data if validation passed
        if (result.success && result.data) {
          try {
            await onSave(result.data);
            results.push({ ...result, rowIndex: i + 2 }); // +2 for header row and 1-based index

            setProgress(prev => prev ? {
              ...prev,
              current: i + 1,
              successful: prev.successful + 1,
              warnings: prev.warnings + (result.warnings.length > 0 ? 1 : 0)
            } : null);
          } catch (error) {
            result.success = false;
            result.errors.push('Failed to save data');
            results.push({ ...result, rowIndex: i + 2 });

            setProgress(prev => prev ? {
              ...prev,
              current: i + 1,
              failed: prev.failed + 1
            } : null);
          }
        } else {
          results.push({ ...result, rowIndex: i + 2 });
          setProgress(prev => prev ? {
            ...prev,
            current: i + 1,
            failed: prev.failed + 1
          } : null);
        }
      }

      // Show summary toast
      const summary = results.reduce((acc, result) => ({
        successful: acc.successful + (result.success ? 1 : 0),
        warnings: acc.warnings + (result.warnings.length > 0 ? 1 : 0),
        failed: acc.failed + (!result.success ? 1 : 0)
      }), { successful: 0, warnings: 0, failed: 0 });

      toast.success(
        `Import complete: ${summary.successful} successful, ${summary.warnings} with warnings, ${summary.failed} failed`
      );

      return results;
    } catch (error) {
      toast.error('Failed to import data');
      throw error;
    } finally {
      setIsImporting(false);
      setProgress(null);
    }
  }, [type, onSave, toast]);

  const downloadTemplate = useCallback(() => {
    const template = generateImportTemplate(IMPORT_CONFIGS[type]);
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_import_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [type]);

  return {
    importData,
    downloadTemplate,
    isImporting,
    progress
  };
}