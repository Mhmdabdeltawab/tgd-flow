import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { SortDirection } from '../../hooks/useSort';

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
  isVisible?: boolean;
  render?: (row: any) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  onRowClick?: (row: any) => void;
  sort?: {
    column: string | null;
    direction: SortDirection;
  };
  onSort?: (column: string) => void;
  onEditColumns?: () => void;
}

export default function Table({
  columns,
  data,
  onRowClick,
  sort,
  onSort,
  onEditColumns,
}: TableProps) {
  const visibleColumns = columns.filter(col => col.isVisible !== false);

  return (
    <div className="flex flex-col">
      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                      onSort ? 'cursor-pointer select-none' : ''
                    }`}
                    onClick={() => onSort?.(column.key)}
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {sort?.column === column.key && (
                        sort.direction === 'asc' ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!data?.length && (
                <tr>
                  <td colSpan={visibleColumns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  {visibleColumns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                    >
                      {column.render ? (
                        column.render(row)
                      ) : (
                        row[column.key] ?? '-'
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}