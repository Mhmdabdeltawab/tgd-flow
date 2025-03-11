import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDown, FileUp, Building, Package2 } from 'lucide-react';
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
  { key: 'country', header: 'COUNTRY', width: '150px' },
  { key: 'port', header: 'PORT', width: '150px' },
  { 
    key: 'wasteTypes', 
    header: 'WASTE TYPES', 
    width: '250px',
    render: (row: any) => (
      <div className="flex flex-wrap gap-1.5">
        {row.wasteTypes.map((type: string) => (
          <span
            key={type}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
          >
            <Package2 className="w-3 h-3 mr-1" />
            {type}
          </span>
        ))}
      </div>
    )
  },
  { 
    key: 'quantity', 
    header: 'QUANTITY', 
    width: '150px',
    render: (row: any) => (
      <div className="text-gray-900">
        {row.quantity ? `${row.quantity.toLocaleString()} MT` : '0 MT'}
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
      const utilization = (row.quantity / row.capacity) * 100;
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

export default function WarehousesPage() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = React.useState(inventoryStore.getAllWarehouses());
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [isColumnsOpen, setIsColumnsOpen] = React.useState(false);
  const { confirm, ConfirmDialog: confirmDialog } = useConfirm();

  const { exportData, isExporting } = useExport(warehouses);

  // Refresh data when it changes in localStorage
  React.useEffect(() => {
    const handleStorageChange = () => {
      setWarehouses(inventoryStore.getAllWarehouses());
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
    data: warehouses,
    defaultColumns,
    pageId: 'warehouses',
    searchFields: ['id', 'name', 'operatorName', 'country', 'port'],
    initialFilters: {
      country: [],
      port: [],
      wasteTypes: [],
    },
  });

  const filterGroups = [
    createFilterGroup('country', 'Country', Array.from(new Set(warehouses.map(w => w.country)))),
    createFilterGroup('port', 'Port', Array.from(new Set(warehouses.map(w => w.port).filter(Boolean)))),
    createFilterGroup('wasteTypes', 'Waste Types', Array.from(new Set(warehouses.flatMap(w => w.wasteTypes)))),
  ];

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Warehouse',
      message: 'Are you sure you want to delete this warehouse? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      isDanger: true
    });

    if (confirmed) {
      inventoryStore.deleteWarehouse(id);
      setWarehouses(inventoryStore.getAllWarehouses());
      setSelectedRow(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Warehouses"
        description="Manage warehouses and their inventory"
        actions={
          <Button 
            variant="primary"
            onClick={() => navigate('/warehouses/new')}
          >
            New Warehouse
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
          searchPlaceholder="Search warehouses by ID, name, operator..."
          secondaryActions={[
            {
              icon: FileDown,
              label: 'Export',
              onClick: () => exportData({
                filename: `warehouses-${new Date().toISOString().split('T')[0]}`,
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
        title="Warehouse Details"
        onEdit={() => navigate(`/warehouses/edit/${selectedRow?.id}`)}
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
            title: 'Location',
            rows: [
              { label: 'Country', value: selectedRow?.country },
              { label: 'Port', value: selectedRow?.port || 'Not specified' },
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
                    <Building className="w-4 h-4" />
                    {selectedRow?.capacity ? `${selectedRow.capacity.toLocaleString()} MT` : 'Not set'}
                  </div>
                )
              },
              { 
                label: 'Current Quantity', 
                value: (
                  <div className="text-gray-900">
                    {selectedRow?.quantity.toLocaleString()} MT
                  </div>
                ),
                capacity: {
                  current: selectedRow?.quantity ?? 0,
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