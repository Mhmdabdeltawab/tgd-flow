import { useCallback } from 'react';
import { convertToCSV } from '../utils/export';

interface ShareOptions {
  title?: string;
  columns?: string[];
  recipient?: string;
  subject?: string;
  body?: string;
}

export function useShare<T extends Record<string, any>>(data: T[]) {
  const shareData = useCallback(({ 
    title = 'Data Export',
    columns,
    recipient = '',
    subject = 'Shared Data',
    body = 'Please find the attached data export.'
  }: ShareOptions = {}) => {
    // Filter data to only include specified columns
    const shareData = data.map(item => {
      if (!columns) return item;
      return columns.reduce((acc, col) => ({
        ...acc,
        [col]: item[col]
      }), {});
    });

    // Convert data to CSV
    const csvContent = convertToCSV(shareData);
    
    // Create file attachment
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], `${title}.csv`, { type: 'text/csv' });

    // Create mailto URL with attachment
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.location.href = mailtoUrl;
  }, [data]);

  return { shareData };
}