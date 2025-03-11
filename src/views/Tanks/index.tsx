import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDown, FileUp, Container, Ship, Calendar, AlertTriangle, Package2, FileText } from 'lucide-react';
import Table from '../../common/components/Table/Table';
import TableToolbar from '../../common/components/Table/TableToolbar';
import FiltersSidebar from '../../common/components/Filters/FiltersSidebar';
import ColumnsSidebar from '../../common/components/Table/ColumnsSidebar';
import PageHeader from '../../common/components/PageHeader/PageHeader';
import Button from '../../common/components/Button/Button';
import DetailsPanel from '../../common/components/DetailsPanel/DetailsPanel';
import StatusBadge from '../../common/components/StatusBadge/StatusBadge';
import { useDataTable } from '../../common/hooks/useDataTable';
import { Column } from '../../common/components/Table/ColumnsSidebar';
import { useExport } from '../../common/hooks/useExport';
import { useConfirm } from '../../common/hooks/useConfirm';
import ConfirmDialog from '../../common/components/ConfirmDialog/ConfirmDialog';
import { tankStore } from '../../common/stores/tankStore';
import { shipmentStore } from '../../common/stores/shipmentStore'; 
import { contractsStore } from '../../common/stores/contractsStore';

const defaultColumns: Column[] = [
  { 
    key: 'id', 
    header: 'TANK ID', 
    width: '160px',
    render: (row: any) => (
      <div className="flex items-center gap-2">
        <Container className="w-4 h-4 text-gray-400" />
        <span>{row.id}</span>
      </div>
    )
  },
  { 
    key: 'status', 
    header: 'STATUS', 
    width: '140px',
    render: (row: any) => <StatusBadge status={row.status} size="sm" />
  },
  {
    key: 'location',
    header: 'DESTINATION',
    width: '200px',
    render: (row: any) => {
      const shipment = shipmentStore.getById(row.shipmentId);
      return shipment && (
        <div>
          <div className="text-gray-900">{shipment.terminal}</div>
          <div className="text-xs text-gray-500">
            {shipment.port}, {shipment.country}
          </div>
        </div>
      );
    }
  },
  {
    key: 'origin',
    header: 'ORIGIN',
    width: '200px',
    render: (row: any) => {
      const shipment = shipmentStore.getById(row.shipmentId);
      const contract = shipment ? contractsStore.getById(shipment.contractId) : null;
      return contract && (
        <div>
          <div className="text-gray-900">{contract.originCountry}</div>
          <div className="text-xs text-gray-500">
            From Contract: {contract.id}
          </div>
        </div>
      );
    }
  },
  {
    key: 'productType',
    header: 'PRODUCT',
    width: '120px',
    render: (row: any) => {
      const shipment = shipmentStore.getById(row.shipmentId);
      return shipment && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Package2 className="w-3 h-3 mr-1" />
          {shipment.productType}
        </span>
      );
    }
  },
  {
    key: 'packingStandard',
    header: 'PACKING',
    width: '150px',
    render: (row: any) => {
      const shipment = shipmentStore.getById(row.shipmentId);
      const contract = shipment ? contractsStore.getById(shipment.contractId) : null;
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          {contract?.packingStandard || 'No packing standard'}
        </span>
      );
    }
  },
  { 
    key: 'shipment', 
    header: 'SHIPMENT', 
    width: '180px',
    render: (row: any) => {
      const shipment = shipmentStore.getById(row.shipmentId);
      return shipment ? (
        <div className="flex items-center gap-2">
          <Ship className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900">{shipment.id}</span>
        </div>
      ) : null;
    }
  },
  { 
    key: 'quantity', 
    header: 'QUANTITY', 
    width: '120px',
    render: (row: any) => (
      <div className="text-gray-900">
        {row.quantity.toLocaleString()} MT
      </div>
    )
  },
  { 
    key: 'quality', 
    header: 'QUALITY', 
    width: '300px',
    render: (row: any) => (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">FFA:</span>
          <span className="text-sm font-medium text-gray-900">{row.quality.FFA}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">IV:</span>
          <span className="text-sm font-medium text-gray-900">{row.quality.IV}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">S:</span>
          <span className="text-sm font-medium text-gray-900">{row.quality.S}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">M&I:</span>
          <span className="text-sm font-medium text-gray-900">{row.quality.MI}</span>
        </div>
      </div>
    )
  },
  { 
    key: 'departureDate', 
    header: 'DEPARTURE', 
    width: '120px',
    render: (row: any) => new Date(row.departureDate).toLocaleDateString()
  },
  { 
    key: 'arrivalDate', 
    header: 'ARRIVAL', 
    width: '120px',
    render: (row: any) => new Date(row.arrivalDate).toLocaleDateString()
  },
];

export default function TanksPage() {
  const navigate = useNavigate();
  const [tanks, setTanks] = React.useState(tankStore.getAll());
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [isColumnsOpen, setIsColumnsOpen] = React.useState(false);
  const { confirm, ConfirmDialog: confirmDialog } = useConfirm();

  const { exportData, isExporting } = useExport(tanks);

  // Refresh data when it changes in localStorage
  React.useEffect(() => {
    const handleStorageChange = () => {
      setTanks(tankStore.getAll());
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
    data: tanks,
    defaultColumns,
    pageId: 'tanks',
    searchFields: ['id', 'shipmentId', 'status'],
    initialFilters: {
      status: [],
    },
  });

  const filterGroups = [
    createFilterGroup('status', 'Status', ['Loaded', 'Discharged', 'In Transit', 'Delivered', 'Received', 'Cancelled']),
  ];

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Tank',
      message: 'Are you sure you want to delete this tank? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      isDanger: true
    });

    if (confirmed) {
      tankStore.delete(id);
      setTanks(tankStore.getAll());
      setSelectedRow(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Tanks"
        description="Track and manage tanks across shipments"
        actions={
          <Button 
            variant="primary"
            onClick={() => navigate('/tanks/new')}
          >
            New Tank
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
          searchPlaceholder="Search tanks by ID, shipment, status..."
          secondaryActions={[
            {
              icon: FileDown,
              label: 'Export',
              onClick: () => exportData({
                filename: `tanks-${new Date().toISOString().split('T')[0]}`,
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
        title="Tank Details"
        onEdit={() => navigate(`/tanks/edit/${selectedRow?.id}`)}
        onDelete={() => handleDelete(selectedRow?.id)}
        sections={[
          {
            title: 'Basic Information',
            rows: [
              { 
                label: 'Tank ID', 
                value: (
                  <div className="flex items-center gap-2">
                    <Container className="w-4 h-4 text-gray-400" />
                    <span>{selectedRow?.id}</span>
                  </div>
                )
              },
              { 
                label: 'Status', 
                value: selectedRow?.status && <StatusBadge status={selectedRow.status} /> 
              },
              { 
                label: 'Quantity', 
                value: (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Container className="w-4 h-4" />
                    {selectedRow?.quantity.toLocaleString()} MT
                  </div>
                )
              },
            ],
          },
          {
            title: 'Quality Parameters',
            rows: [
              { label: 'FFA', value: selectedRow?.quality?.FFA },
              { label: 'IV', value: selectedRow?.quality?.IV },
              { label: 'S', value: selectedRow?.quality?.S },
              { label: 'M&I', value: selectedRow?.quality?.MI },
            ],
          },
          {
            title: 'Shipment Information',
            rows: [
              { 
                label: 'Shipment ID', 
                value: selectedRow && (
                  <div className="flex items-center gap-2">
                    <Ship className="w-4 h-4 text-gray-500" />
                    <span>{selectedRow.shipmentId}</span>
                  </div>
                )
              },
              {
                label: 'Destination',
                value: selectedRow && (() => {
                  const shipment = shipmentStore.getById(selectedRow.shipmentId);
                  return shipment && (
                    <div className="space-y-2">
                      <div>
                        <div className="text-gray-900">{shipment.terminal}</div>
                        <div className="text-sm text-gray-500">{shipment.port}, {shipment.country}</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Ship className="w-4 h-4" />
                        {shipment.shippingLine}
                      </div>
                    </div>
                  );
                })()
              },
              {
                label: 'Product Details',
                value: selectedRow && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package2 className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">
                        {(() => {
                          const shipment = shipmentStore.getById(selectedRow.shipmentId);
                          return shipment?.productType;
                        })()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {(() => {
                        const shipment = shipmentStore.getById(selectedRow.shipmentId);
                        return shipment ? `${shipment.quantity.toLocaleString()} MT total` : '';
                      })()}
                    </div>
                  </div>
                )
              }
            ],
          },
          {
            title: 'Dates',
            rows: [
              { 
                label: 'Departure Date', 
                value: (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-900">
                        {new Date(selectedRow?.departureDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedRow?.status === 'Loaded' && 'Tank loaded'}
                      </div>
                    </div>
                  </div>
                )
              },
              { 
                label: 'Arrival Date', 
                value: (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-900">
                        {new Date(selectedRow?.arrivalDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedRow?.status === 'Delivered' && 'Tank delivered'}
                      </div>
                    </div>
                  </div>
                )
              },
            ],
          },
        ]}
      />
      
      {confirmDialog && <ConfirmDialog {...confirmDialog} />}
    </div>
  );
}