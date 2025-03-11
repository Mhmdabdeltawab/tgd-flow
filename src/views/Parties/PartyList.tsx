import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDown, FileUp, Building2, User2, Container, Building } from 'lucide-react';
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
import { partyStore } from '../../common/stores/partyStore';
import { inventoryStore } from '../../common/stores/inventoryStore';
import { PartyType } from '../../common/types/party';

const defaultColumns: Column[] = [
  { key: 'id', header: 'ID', width: '100px' },
  { key: 'name', header: 'NAME', width: '200px' },
  { 
    key: 'assetCount', 
    header: 'ASSETS', 
    width: '120px',
    render: (row: any) => {
      const storageTanks = inventoryStore.getAllStorageTanks().filter(tank => 
        tank.operatorId === row.id
      );
      const warehouses = inventoryStore.getAllWarehouses().filter(warehouse => 
        warehouse.operatorId === row.id
      );
      
      if (!storageTanks.length && !warehouses.length) return null;
      
      return (
        <div className="flex items-center gap-2">
          {storageTanks.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Container className="w-3 h-3" />
              {storageTanks.length}
            </span>
          )}
          {warehouses.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              <Building className="w-3 h-3" />
              {warehouses.length}
            </span>
          )}
        </div>
      );
    }
  },
  { key: 'country', header: 'COUNTRY', width: '150px' },
  { key: 'countryCode', header: 'COUNTRY CODE', width: '120px' },
  { key: 'accountManager', header: 'ACCOUNT MANAGER', width: '180px' },
  { key: 'email', header: 'EMAIL', width: '200px' },
  { key: 'phone', header: 'PHONE', width: '150px' },
  { key: 'isccNumber', header: 'ISCC NUMBER', width: '150px' },
  { key: 'isccExpiry', header: 'ISCC EXPIRY', width: '120px' },
];

interface PartyListProps {
  type: PartyType;
}

export default function PartyList({ type }: PartyListProps) {
  const navigate = useNavigate();
  const [parties, setParties] = React.useState(partyStore.getAll(type));
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [isColumnsOpen, setIsColumnsOpen] = React.useState(false);
  const { confirm, ConfirmDialog: confirmDialog } = useConfirm();

  const { exportData, isExporting } = useExport(parties);

  // Refresh data when it changes in localStorage
  React.useEffect(() => {
    const handleStorageChange = () => {
      setParties(partyStore.getAll(type));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [type]);

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
    data: parties,
    defaultColumns,
    pageId: type,
    searchFields: ['id', 'name', 'country', 'accountManager', 'email'],
    initialFilters: {
      country: [],
    },
  });

  const filterGroups = [
    createFilterGroup('country', 'Country', Array.from(new Set(parties.map(party => party.country)))),
    createFilterGroup('countryCode', 'Country Code', Array.from(new Set(parties.map(party => party.countryCode)))),
  ];

  const handleRowClick = (row: any) => {
    // Get terminals operated by this party
    const terminals = inventoryStore.getAllTerminals().filter(terminal => {
      const storageTanks = inventoryStore.getStorageTanksByTerminal(terminal.id);
      return storageTanks.some(tank => tank.operatorId === row.id);
    });

    // Get storage tanks operated by this party
    const storageTanks = inventoryStore.getAllStorageTanks().filter(tank => 
      tank.operatorId === row.id
    );

    // Get warehouses operated by this party
    const warehouses = inventoryStore.getAllWarehouses().filter(warehouse => 
      warehouse.operatorId === row.id
    );

    // Enhance row data with assets
    setSelectedRow({
      ...row,
      terminals,
      storageTanks,
      warehouses
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: `Delete ${type === 'suppliers' ? 'Supplier' : 'Buyer'}`,
      message: `Are you sure you want to delete this ${type === 'suppliers' ? 'supplier' : 'buyer'}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      isDanger: true
    });

    if (confirmed) {
      partyStore.delete(type, id);
      setParties(partyStore.getAll(type));
      setSelectedRow(null);
    }
  };

  const title = type === 'suppliers' ? 'Suppliers' : 'Buyers';
  const Icon = type === 'suppliers' ? Building2 : User2;

  return (
    <div>
      <PageHeader
        title={title}
        description={`Manage ${title.toLowerCase()} and their information`}
        actions={
          <Button 
            variant="primary"
            onClick={() => navigate(`/${type}/new`)}
          >
            New {title.slice(0, -1)}
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
          searchPlaceholder={`Search ${title.toLowerCase()} by ID, name, country...`}
          secondaryActions={[
            {
              icon: FileDown,
              label: 'Export',
              onClick: () => exportData({
                filename: `${type}-${new Date().toISOString().split('T')[0]}`,
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
        title={`${title.slice(0, -1)} Details`}
        onEdit={() => navigate(`/${type}/edit/${selectedRow?.id}`)}
        onDelete={() => handleDelete(selectedRow?.id)}
        sections={[
          {
            title: 'Basic Information',
            rows: [
              { label: 'ID', value: selectedRow?.id },
              { label: 'Name', value: selectedRow?.name },
              { label: 'Account Manager', value: selectedRow?.accountManager },
            ],
          },
          {
            title: 'Contact Information',
            rows: [
              { label: 'Email', value: selectedRow?.email },
              { label: 'Phone', value: selectedRow?.phone },
            ],
          },
          {
            title: 'Location',
            rows: [
              { label: 'Country', value: selectedRow?.country },
              { label: 'Country Code', value: selectedRow?.countryCode },
            ],
          },
          {
            title: 'ISCC Information',
            rows: [
              { label: 'ISCC Number', value: selectedRow?.isccNumber, highlight: true },
              { label: 'ISCC Expiry', value: selectedRow?.isccExpiry },
            ],
          },
          // Only show Assets section if there are any assets
          ...(selectedRow?.terminals?.length || selectedRow?.warehouses?.length ? [{
            title: 'Assets',
            rows: [
              ...(selectedRow?.storageTanks?.length ? [{
                label: 'Storage Tanks',
                value: (
                  <div className="space-y-2">
                    {selectedRow.storageTanks.map((tank: any) => {
                      const terminal = inventoryStore.getTerminalById(tank.terminalId);
                      
                      return (
                        <div 
                          key={tank.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer w-full"
                          onClick={() => navigate(`/storage-tanks/edit/${tank.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <Container className="w-4 h-4 text-gray-500" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {tank.name}
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <div className="text-xs text-gray-500">
                                  {terminal?.name} • {terminal?.port}, {terminal?.country}
                                </div>
                                <div className="text-xs font-medium text-gray-700">
                                  {tank.quantity.toLocaleString()} MT
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              }] : []),
              ...(selectedRow?.warehouses?.length ? [{
                label: 'Warehouses',
                value: (
                  <div className="space-y-2">
                    {selectedRow.warehouses.map((warehouse: any) => (
                      <div 
                        key={warehouse.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer w-full"
                        onClick={() => navigate(`/warehouses/edit/${warehouse.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <Building className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {warehouse.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {warehouse.quantity.toLocaleString()} MT
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }] : [])
            ]
          }] : []),
        ]}
      />
      
      {confirmDialog && <ConfirmDialog {...confirmDialog} />}
    </div>
  );
}