import { useCallback } from 'react';

interface PrintOptions {
  title?: string;
  columns?: string[];
}

export function usePrint<T extends Record<string, any>>(data: T[]) {
  const printData = useCallback(({ title = 'Data Export', columns }: PrintOptions = {}) => {
    // Filter data to only include specified columns
    const printData = data.map(item => {
      if (!columns) return item;
      return columns.reduce((acc, col) => ({
        ...acc,
        [col]: item[col]
      }), {});
    });

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate table HTML
    const tableHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #f8f9fa; }
            .header { margin-bottom: 20px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${Object.keys(printData[0] || {}).map(key => 
                  `<th>${key.toUpperCase()}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${printData.map(row => `
                <tr>
                  ${Object.values(row).map(value => 
                    `<td>${typeof value === 'object' ? JSON.stringify(value) : value}</td>`
                  ).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px;">
            Print
          </button>
        </body>
      </html>
    `;

    printWindow.document.write(tableHtml);
    printWindow.document.close();
  }, [data]);

  return { printData };
}