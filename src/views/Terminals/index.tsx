import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDown, FileUp, Warehouse, Package2, Container } from 'lucide-react';
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
import { inventoryStore } from '../../common/stores/inventoryStore.tsx';

const defaultColumns: Column[] = [
  { key: 'id', header: 'ID', width: '100px' },
  { key: 'name', header: 'NAME', width: '200px' },
  { key: 'country', header: 'COUNTRY', width: '150px' },
  { key: 'port', header: 'PORT', width: '150px' },
  { 
    key: 'wasteTypes', 
    header: 'WASTE TYPES', 
    width: '250px',
    render: (row: any) => (
      <div className="flex flex-wrap gap-1.5">
        {(row.wasteTypes || []).map((type: string) => (
          <span
            key={type}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
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
      const utilization = (row.actualQuantity || 0) / row.capacity * 100;
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
  { key: 'storageTankCount', header: 'STORAGE TANKS', width: '120px' },
];

export default function TerminalsPage() {
  const navigate = useNavigate();
  const [terminals, setTerminals] = React.useState(inventoryStore.getAllTerminals());
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [isColumnsOpen, setIsColumnsOpen] = React.useState(false);
  const { confirm, ConfirmDialog: confirmDialog } = useConfirm();

  const { exportData, isExporting } = useExport(terminals);

  // Refresh data when it changes in localStorage
  React.useEffect(() => {
    const handleStorageChange = () => {
      setTerminals(inventoryStore.getAllTerminals());
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
    data: terminals,
    defaultColumns,
    pageId: 'terminals',
    searchFields: ['id', 'name', 'country', 'port'],
    initialFilters: {
      country: [],
      port: [],
      wasteTypes: [],
    },
  });

  const filterGroups = [
    createFilterGroup('country', 'Country', Array.from(new Set(terminals.map(t => t.country)))),
    createFilterGroup('port', 'Port', Array.from(new Set(terminals.map(t => t.port)))),
    createFilterGroup('wasteTypes', 'Waste Types', Array.from(new Set(terminals.flatMap(t => t.wasteTypes || [])))),
  ];

  const handleRowClick = (row: any) => {
    try {
      // Get storage tanks for this terminal
      const storageTanks = inventoryStore.getStorageTanksByTerminal(row.id);
      setSelectedRow({ ...row, storageTanks });
    } catch (error) {
      console.error('Error loading storage tanks:', error);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Terminal',
      message: 'Are you sure you want to delete this terminal? This will also delete all associated storage tanks. This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      isDanger: true
    });

    if (confirmed) {
      inventoryStore.deleteTerminal(id);
      setTerminals(inventoryStore.getAllTerminals());
      setSelectedRow(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Terminals"
        description="Manage terminals and their storage tanks"
        actions={
          <Button 
            variant="primary"
            onClick={() => navigate('/terminals/new')}
          >
            New Terminal
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
          searchPlaceholder="Search terminals by ID, name, location..."
          secondaryActions={[
            {
              icon: FileDown,
              label: 'Export',
              onClick: () => exportData({
                filename: `terminals-${new Date().toISOString().split('T')[0]}`,
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
          onRowClick={handleRowClick}
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
        title="Terminal Details"
        onEdit={() => navigate(`/terminals/edit/${selectedRow?.id}`)}
        onDelete={() => handleDelete(selectedRow?.id)}
        sections={[
          {
            title: 'Basic Information',
            rows: [
              { label: 'ID', value: selectedRow?.id },
              { label: 'Name', value: selectedRow?.name },
            ],
          },
          {
            title: 'Location',
            rows: [
              { label: 'Country', value: selectedRow?.country },
              { label: 'Port', value: selectedRow?.port },
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
                    <Warehouse className="w-4 h-4" />
                    {selectedRow?.capacity ? `${selectedRow.capacity.toLocaleString()} MT` : 'Not set'}
                  </div>
                )
              },
              { 
                label: 'Storage Tanks', 
                value: (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Container className="w-4 h-4" />
                    {selectedRow?.storageTankCount || 0} tanks
                    {selectedRow?.storageTanks?.length > 0 && (
                      <span>
                        ({selectedRow.storageTanks.reduce((sum: number, tank: any) => sum + (tank.capacity || 0), 0).toLocaleString()} MT total capacity)
                      </span>
                    )}
                  </div>
                )
              },
              { 
                label: 'Actual Quantity', 
                value: (
                  <div className="text-gray-900">
                    {selectedRow?.actualQuantity.toLocaleString()} MT
                  </div>
                ),
                capacity: {
                  current: selectedRow?.actualQuantity ?? 0,
                  total: selectedRow?.capacity
                },
                highlight: true
              },
              { 
                label: 'Expected Quantity', 
                value: (
                  <div className="text-gray-600">
                    {selectedRow?.expectedQuantity.toLocaleString()} MT
                  </div>
                )
              },
            ],
          },
        ]}
        relatedItems={selectedRow?.storageTanks?.length ? [
          {
            title: 'Storage Tanks',
            items: selectedRow.storageTanks.map((tank: any) => ({
              id: tank.id,
              title: tank.name,
              subtitle: `${tank.quantity.toLocaleString()} MT`,
              onClick: () => navigate(`/storage-tanks/edit/${tank.id}`),
            })),
          },
        ] : undefined}
      />
      
      {confirmDialog && <ConfirmDialog {...confirmDialog} />}
    </div>
  );
}