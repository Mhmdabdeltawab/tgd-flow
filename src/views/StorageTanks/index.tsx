import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDown, FileUp, Container, Package2, Building2 } from 'lucide-react';
import Table from '../../common/components/Table/Table';
import TableToolbar from '../../common/components/Table/TableToolbar';
import FiltersSidebar from '../../common/components/Filters/FiltersSidebar';
import ColumnsSidebar from '../../common/components/Table/ColumnsSidebar';
import PageHeader from '../../common/components/PageHeader/PageHeader';
import Button from '../../common/components/Button/Button';
import DetailsPanel from '../../common/components/DetailsPanel/DetailsPanel';
import { useDataTable } from '../../common/hooks/useDataTable';
import { Column } from '../../common/components/Table/ColumnsSidebar';
import { useExport } from '../../common/hooks/useExport';
import { useConfirm } from '../../common/hooks/useConfirm';
import ConfirmDialog from '../../common/components/ConfirmDialog/ConfirmDialog';
import { inventoryStore } from '../../common/stores/inventoryStore';

const defaultColumns: Column[] = [
  { key: 'id', header: 'ID', width: '100px' },
  { key: 'name', header: 'NAME', width: '200px' },
  { key: 'operatorName', header: 'OPERATOR', width: '200px' },
  { 
    key: 'terminal', 
    header: 'TERMINAL', 
    width: '200px',
    render: (row: any) => {
      const terminal = inventoryStore.getTerminalById(row.terminalId);
      return terminal ? (
        <div>
          <div className="text-gray-900">{terminal.name}</div>
          <div className="text-xs text-gray-500">
            {terminal.port}, {terminal.country}
          </div>
        </div>
      ) : null;
    }
  },
  { 
    key: 'wasteTypes', 
    header: 'WASTE TYPES', 
    width: '250px',
    render: (row: any) => (
      <div className="flex flex-wrap gap-1.5">
        {row.wasteTypes.map((type: string) => (
          <span
            key={type}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"
          >
            <Package2 className="w-3 h-3 mr-1" />
            {type}
          </span>
        ))}
      </div>
    )
  },
  {
    key: 'actualQuantity',
    header: 'ACTUAL QUANTITY',
    width: '150px',
    render: (row: any) => (
      <div className="text-gray-900">
        {row.actualQuantity ? `${row.actualQuantity.toLocaleString()} MT` : '0 MT'}
      </div>
    )
  },
  {
    key: 'expectedQuantity',
    header: 'EXPECTED QUANTITY',
    width: '150px',
    render: (row: any) => (
      <div className="text-gray-600">
        {row.expectedQuantity ? `${row.expectedQuantity.toLocaleString()} MT` : '0 MT'}
      </div>
    )
  },
  { 
    key: 'capacity', 
    header: 'CAPACITY', 
    width: '120px',
    render: (row: any) => (
      <div className={`${row.capacity ? 'text-gray-900' : 'text-gray-500'}`}>
        {row.capacity ? `${row.capacity.toLocaleString()} MT` : 'Not set'}
      </div>
    )
  },
  { 
    key: 'utilization', 
    header: 'UTILIZATION', 
    width: '120px',
    render: (row: any) => {
      if (!row.capacity) return (
        <div className="text-gray-500">No capacity set</div>
      );
      const utilization = (row.actualQuantity / row.capacity) * 100;
      let color = 'text-green-600';
      if (utilization > 90) color = 'text-red-600';
      else if (utilization > 75) color = 'text-yellow-600';
      
      return (
        <div className={color}>
          {utilization.toFixed(1)}%
        </div>
      );
    }
  },
];

export default function StorageTanksPage() {
  const navigate = useNavigate();
  const [storageTanks, setStorageTanks] = React.useState(inventoryStore.getAllStorageTanks());
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [isColumnsOpen, setIsColumnsOpen] = React.useState(false);
  const { confirm, ConfirmDialog: confirmDialog } = useConfirm();

  const { exportData, isExporting } = useExport(storageTanks);

  // Refresh data when it changes in localStorage
  React.useEffect(() => {
    const handleStorageChange = () => {
      setStorageTanks(inventoryStore.getAllStorageTanks());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const {
    data: tableData,
    columns,
    setColumns,
    visibleColumns,
    searchQuery,
    setSearchQuery,
    activeFiltersCount,
    clearFilters,
    createFilterGroup,
    sort,
    toggleSort,
  } = useDataTable({
    data: storageTanks,
    defaultColumns,
    pageId: 'storage-tanks',
    searchFields: ['id', 'name', 'operatorName', 'terminalId'],
    initialFilters: {
      terminal: [],
      wasteTypes: [],
    },
  });

  const filterGroups = [
    createFilterGroup('terminal', 'Terminal', Array.from(new Set(storageTanks.map(tank => {
      const terminal = inventoryStore.getTerminalById(tank.terminalId);
      return terminal?.name || '';
    })))),
    createFilterGroup('wasteTypes', 'Waste Types', Array.from(new Set(storageTanks.flatMap(tank => tank.wasteTypes)))),
  ];

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Storage Tank',
      message: 'Are you sure you want to delete this storage tank? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      isDanger: true
    });

    if (confirmed) {
      inventoryStore.deleteStorageTank(id);
      setStorageTanks(inventoryStore.getAllStorageTanks());
      setSelectedRow(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Storage Tanks"
        description="Manage storage tanks and their inventory"
        actions={
          <Button 
            variant="primary"
            onClick={() => navigate('/storage-tanks/new')}
          >
            New Storage Tank
          </Button>
        }
      />

      <div className="p-6">
        <TableToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onEditColumns={() => setIsColumnsOpen(true)}
          onOpenFilters={() => setIsFilterOpen(true)}
          activeFilters={activeFiltersCount}
          searchPlaceholder="Search storage tanks by ID, name, operator..."
          secondaryActions={[
            {
              icon: FileDown,
              label: 'Export',
              onClick: () => exportData({
                filename: `storage-tanks-${new Date().toISOString().split('T')[0]}`,
                format: 'csv',
                columns: visibleColumns.map(col => col.key)
              }),
              variant: 'ghost'
            },
            {
              icon: FileUp,
              label: 'Import',
              onClick: () => console.log('Import clicked'),
              variant: 'ghost'
            }
          ]}
        />

        <Table
          columns={visibleColumns}
          data={tableData}
          sort={sort}
          onSort={toggleSort}
          onRowClick={setSelectedRow}
          onEditColumns={() => setIsColumnsOpen(true)}
        />
      </div>

      <FiltersSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onClearAll={clearFilters}
        filterGroups={filterGroups}
      />
      
      <ColumnsSidebar
        isOpen={isColumnsOpen}
        onClose={() => setIsColumnsOpen(false)}
        columns={columns}
        onColumnsChange={setColumns}
      />
      
      <DetailsPanel
        isOpen={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        title="Storage Tank Details"
        onEdit={() => navigate(`/storage-tanks/edit/${selectedRow?.id}`)}
        onDelete={() => handleDelete(selectedRow?.id)}
        sections={[
          {
            title: 'Basic Information',
            rows: [
              { label: 'ID', value: selectedRow?.id },
              { label: 'Name', value: selectedRow?.name },
              { label: 'Operator', value: selectedRow?.operatorName },
            ],
          },
          {
            title: 'Terminal',
            rows: [
              { 
                label: 'Terminal', 
                value: selectedRow && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span>{inventoryStore.getTerminalById(selectedRow.terminalId)?.name}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {inventoryStore.getTerminalById(selectedRow.terminalId)?.port}, 
                      {inventoryStore.getTerminalById(selectedRow.terminalId)?.country}
                    </div>
                  </div>
                )
              },
            ],
          },
          {
            title: 'Waste Types',
            rows: [
              { 
                label: 'Accepted Types', 
                value: selectedRow?.wasteTypes?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedRow.wasteTypes.map((type: string) => (
                      <span
                        key={type}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        <Package2 className="w-3 h-3 mr-1" />
                        {type}
                      </span>
                    ))}
                  </div>
                ) : 'No waste types specified'
              },
            ],
          },
          {
            title: 'Storage',
            rows: [
              { 
                label: 'Capacity', 
                value: (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Container className="w-4 h-4" />
                    {selectedRow?.capacity ? `${selectedRow.capacity.toLocaleString()} MT` : 'Not set'}
                  </div>
                )
              },
              { 
                label: 'Current Quantity', 
                value: (
                  <div className="space-y-2">
                    <div className="text-gray-900">
                      {selectedRow?.actualQuantity.toLocaleString()} MT actual
                    </div>
                    <div className="text-gray-600">
                      {selectedRow?.expectedQuantity.toLocaleString()} MT expected
                    </div>
                  </div>
                ),
                capacity: {
                  current: selectedRow?.actualQuantity ?? 0,
                  total: selectedRow?.capacity
                },
                highlight: true
              },
            ],
          },
        ]}
      />
      
      {confirmDialog && <ConfirmDialog {...confirmDialog} />}
    </div>
  );
}