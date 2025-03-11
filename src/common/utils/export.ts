// Helper function to convert data to CSV
export function convertToCSV(data: Record<string, any>[]) {
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