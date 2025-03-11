import { useState, useCallback } from 'react';
import { Contract, contractsStore } from '../stores/contractsStore';
import { parseImportFile, validateAndMapContract, generateImportTemplate } from '../utils/importContracts';
import { useToast } from './useToast';

interface ImportProgress {
  total: number;
  current: number;
  successful: number;
  warnings: number;
  failed: number;
}

export function useContractImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const toast = useToast();

  const importContracts = useCallback(async (file: File) => {
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
        const result = validateAndMapContract(row, headers);

        // Create contract if validation passed
        if (result.success && result.data) {
          try {
            await contractsStore.create(result.data as Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'status'>);
            results.push({ ...result, rowIndex: i + 2 }); // +2 for header row and 1-based index

            setProgress(prev => prev ? {
              ...prev,
              current: i + 1,
              successful: prev.successful + 1,
              warnings: prev.warnings + (result.warnings.length > 0 ? 1 : 0)
            } : null);
          } catch (error) {
            result.success = false;
            result.errors.push('Failed to create contract');
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
      toast.error('Failed to import contracts');
      throw error;
    } finally {
      setIsImporting(false);
      setProgress(null);
    }
  }, [toast]);

  const downloadTemplate = useCallback(() => {
    const template = generateImportTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contracts_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    importContracts,
    downloadTemplate,
    isImporting,
    progress
  };
}