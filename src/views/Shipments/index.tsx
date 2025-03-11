import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDown, FileUp, Ship, Package2, AlertTriangle, FileText, BadgeCheck, Building2, User, Container, Trash2 } from 'lucide-react';
import StatusBadge from '../../common/components/StatusBadge/StatusBadge';
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
import RouteDialog from '../../common/components/RouteDialog/RouteDialog';
import { shipmentStore } from '../../common/stores/shipmentStore';
import { documentStore } from '../../common/stores/documentStore';
import { DocumentViewer } from '../../common/components/Documents';
import { tankStore } from '../../common/stores/tankStore';
import { terminalStore } from '../../common/stores/terminalStore';
import { contractsStore } from '../../common/stores/contractsStore';
import { partyStore } from '../../common/stores/partyStore';
import { useToast } from '../../common/hooks/useToast';
import TanksList from './TanksList';

const defaultColumns: Column[] = [
  { 
    key: 'id', 
    header: 'SHIPMENT ID', 
    width: '180px',
    render: (row: any) => (
      <div className="flex items-center gap-2">
        <Ship className="w-4 h-4 text-gray-400" />
        <span>{row.id}</span>
      </div>
    )
  },
  { 
    key: 'type',
    header: 'TYPE',
    width: '120px',
    render: (row: any) => <StatusBadge status={row.type} size="sm" />
  },
  { 
    key: 'status', 
    header: 'STATUS', 
    width: '140px',
    render: (row: any) => <StatusBadge status={row.status} size="sm" />
  },
  {
    key: 'routing',
    header: 'ROUTING',
    width: '200px',
    render: (row: any) => {
      if (row.type !== 'Supply') return null;
      
      if (row.routingDetails) {
        const salesContract = contractsStore.getById(row.routingDetails.routedToContractId);
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <BadgeCheck className="w-3.5 h-3.5" />
            <div>
              <div>Routed</div>
              <div className="text-[10px] text-green-600">
                to {salesContract?.id}
              </div>
            </div>
          </div>
        );
      }

      if (row.status === 'cancelled') {
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <div>
              <div>Cannot Route</div>
              <div className="text-[10px] text-gray-400">
                Cancelled shipment
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          <div>
            <div>Not Routed</div>
            
          </div>
        </div>
      );
    }
  },
  { 
    key: 'contractId', 
    header: 'CONTRACT', 
    width: '180px',
    render: (row: any) => (
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-gray-400" />
        <span>{row.contractId}</span>
      </div>
    )
  },
  { key: 'productType', header: 'PRODUCT', width: '120px' },
  { 
    key: 'quantity',
    header: 'SHIPMENT QUANTITY',
    width: '180px',
    render: (row: any) => (
      <div className="text-gray-900">
        {row.quantity.toLocaleString()} MT
      </div>
    )
  },
  {
    key: 'origin',
    header: 'ORIGIN',
    width: '180px',
    render: (row: any) => {
      const contract = row.contractId ? contractsStore.getById(row.contractId) : null;
      return contract && (
        <div className="text-gray-900">
          {contract.originCountry}
        </div>
      );
    }
  },
  {
    key: 'destination',
    header: 'DESTINATION',
    width: '180px',
    render: (row: any) => (
      <div className="text-gray-900">
        {row.country}
      </div>
    )
  },
  {
    key: 'tanks',
    header: 'TANKS',
    width: '180px',
    render: (row: any) => {
      const tanks = row.id ? tankStore.getByShipmentId(row.id) || [] : [];
      const totalTankQuantity = tanks.reduce((sum, tank) => sum + (tank?.quantity || 0), 0);
      
      return (
        <div className="flex items-center gap-2">
          <Container className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-gray-900">
              {tanks.length} tanks
            </div>
            <div className="text-xs text-gray-500">
              {totalTankQuantity.toLocaleString()} MT allocated
            </div>
          </div>
        </div>
      );
    }
  },
  {
    key: 'quality',
    header: 'QUALITY',
    width: '300px',
    render: (row: any) => {
      const tanks = tankStore.getByShipmentId(row.id);
      if (tanks.length === 0) return (
        <div className="text-gray-500 text-sm">No tanks assigned</div>
      );
      
      const quality = row.quality;
      if (!quality) return (
        <div className="text-gray-500 text-sm">N/A</div>
      );

      return (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">FFA:</span>
            <span className="text-sm font-medium text-gray-900">
              {quality.weightedAverageFFA.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">IV:</span>
            <span className="text-sm font-medium text-gray-900">
              {quality.weightedAverageIV.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">S:</span>
            <span className="text-sm font-medium text-gray-900">
              {quality.weightedAverageS.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">M&I:</span>
            <span className="text-sm font-medium text-gray-900">
              {quality.weightedAverageM1.toFixed(2)}
            </span>
          </div>
        </div>
      );
    }
  },
  { 
    key: 'terminal', 
    header: 'TERMINAL', 
    width: '180px',
    render: (row: any) => {
      const terminal = terminalStore.getAll().find(t => t.name === row.terminal);
      return terminal ? (
        <div>
          <div className="text-gray-900">{terminal.name}</div>
          <div className="text-xs text-gray-500">
            {terminal.port}, {terminal.country}
          </div>
        </div>
      ) : row.terminal;
    }
  },
  { key: 'shippingLine', header: 'SHIPPING LINE', width: '180px' },
  { key: 'departureDate', header: 'DEPARTURE', width: '120px' },
  { key: 'arrivalDate', header: 'ARRIVAL', width: '120px' },
  {
    key: 'documents',
    header: 'DOCUMENTS',
    width: '180px',
    render: (row: any) => {
      return (
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
            row.hasSD ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}>
            {row.hasSD ? (
              <>
                <BadgeCheck className="w-3.5 h-3.5" />
                SD
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                SD
              </>
            )}
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
            row.hasBL ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}>
            {row.hasBL ? (
              <>
                <BadgeCheck className="w-3.5 h-3.5" />
                BL
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                BL
              </>
            )}
          </div>
        </div>
      );
    }
  }
];

export default function ShipmentsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [shipments, setShipments] = React.useState(shipmentStore.getAll());
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [isColumnsOpen, setIsColumnsOpen] = React.useState(false);
  const [selectedDocument, setSelectedDocument] = React.useState<any>(null);
  const [showRouteDialog, setShowRouteDialog] = React.useState(false);
  const { confirm, ConfirmDialog: confirmDialog } = useConfirm();

  const { exportData, isExporting } = useExport(shipments);

  // Refresh data when it changes in localStorage
  React.useEffect(() => {
    const handleStorageChange = () => {
      setShipments(shipmentStore.getAll());
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
    data: shipments,
    defaultColumns,
    pageId: 'shipments',
    searchFields: ['id', 'contractId', 'terminal', 'shippingLine'],
    initialFilters: {
      status: [],
      productType: [],
    },
  });

  const filterGroups = [
    createFilterGroup('status', 'Status', ['scheduled', 'in_transit', 'delivered', 'received', 'cancelled']),
    createFilterGroup('productType', 'Product Type', Array.from(new Set(shipments.map(s => s.productType)))),
    createFilterGroup('country', 'Country', Array.from(new Set(shipments.map(s => s.country)))),
  ];

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Shipment',
      message: 'Are you sure you want to delete this shipment? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      isDanger: true
    });

    if (confirmed) {
      try {
        shipmentStore.delete(id);
        setShipments(shipmentStore.getAll());
        setSelectedRow(null);
        toast.success('Shipment deleted successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete shipment');
      }
    }
  };

  const handleRowClick = (row: any) => {
    // Get contract details
    const contract = contractsStore.getById(row.contractId);

    // Get routing details if available
    let routedContract = null;
    if (row.routingDetails?.routedToContractId) {
      routedContract = contractsStore.getById(row.routingDetails.routedToContractId);
    }

    // Convert old format IDs to new format
    const buyerId = contract?.buyerId?.replace('BUY', 'BUYER');
    const sellerId = contract?.sellerId?.replace('SUP', 'SUPPLIER');

    const buyer = buyerId ? partyStore.getById('buyers', buyerId) : null;
    const seller = sellerId ? partyStore.getById('suppliers', sellerId) : null;

    // Get documents
    const documents = documentStore.getByEntityId(row.id);
    const hasSD = documents.some(doc => doc.type === 'sustainability_declaration');
    const hasBL = documents.some(doc => doc.type === 'bill_of_lading');

    // Enhance row data with documents
    const enhancedRow = {
      ...row,
      contract,
      buyer: buyer || { name: contract?.buyerName },
      seller: seller || { name: contract?.sellerName },
      routedContract,
      documents,
      hasSD,
      hasBL
    };
    
    setSelectedRow(enhancedRow);
  };

  // Enhance table data with documents
  const enhancedTableData = React.useMemo(() => {
    return tableData.map(row => {
      const documents = documentStore.getByEntityId(row.id);
      const hasSD = documents.some(doc => doc.type === 'sustainability_declaration');
      const hasBL = documents.some(doc => doc.type === 'bill_of_lading');
      return {
        ...row,
        documents,
        hasSD,
        hasBL
      };
    });
  }, [tableData]);
  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc);
  };

  const handleCloseViewer = () => {
    setSelectedDocument(null);
  };

  const handleDeleteDocument = async (docId: string) => {
    const confirmed = await confirm({
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      isDanger: true
    });

    if (confirmed) {
      try {
        documentStore.delete(docId);
        const updatedDocuments = selectedRow.documents.filter((doc: any) => doc.id !== docId);
        setSelectedRow({
          ...selectedRow,
          documents: updatedDocuments
        });
        toast.success('Document deleted successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete document');
      }
    }
  };

  const handleRoute = async (salesContractId: string) => {
    try {
      await shipmentStore.routeShipment(selectedRow.id, salesContractId);
      toast.success('Shipment routed successfully');
      setShowRouteDialog(false);
      // Refresh data
      setShipments(shipmentStore.getAll());
      setSelectedRow(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to route shipment');
    }
  };

  const handleUnroute = async () => {
    const confirmed = await confirm({
      title: 'Remove Routing',
      message: 'Are you sure you want to remove this shipment\'s routing? This action cannot be undone.',
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
      isDanger: true
    });

    if (confirmed) {
      try {
        await shipmentStore.unrouteShipment(selectedRow.id);
        toast.success('Routing removed successfully');
        // Refresh data
        setShipments(shipmentStore.getAll());
        setSelectedRow(null);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to remove routing');
      }
    }
  };

  return (
    <div>
      <PageHeader
        title="Shipments"
        description="Track and manage shipments"
        actions={
          <Button 
            variant="primary"
            onClick={() => navigate('/shipments/new')}
          >
            New Shipment
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
          searchPlaceholder="Search shipments by ID, contract, terminal..."
          secondaryActions={[
            {
              icon: FileDown,
              label: 'Export',
              onClick: () => exportData({
                filename: `shipments-${new Date().toISOString().split('T')[0]}`,
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
          data={enhancedTableData}
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
        title="Shipment Details"
        onEdit={() => navigate(`/shipments/edit/${selectedRow?.id}`)}
        onDelete={() => handleDelete(selectedRow?.id)}
        actions={
          selectedRow?.type === 'Supply' && (
            selectedRow.routingDetails ? (
              <Button
                variant="secondary"
                onClick={handleUnroute}
                className="!text-red-600 hover:!text-red-700 !border-red-200 hover:!border-red-300 hover:!bg-red-50"
              >
                Remove Routing
              </Button>
            ) : selectedRow.status !== 'cancelled' && (
              <Button
                variant="secondary"
                onClick={() => setShowRouteDialog(true)}
                className="!text-indigo-600 hover:!text-indigo-700 !border-indigo-200 hover:!border-indigo-300 hover:!bg-indigo-50"
              >
                Route Shipment
              </Button>
            )
          )
        }
        sections={[
          {
            title: 'Basic Information',
            rows: [
              { label: 'ID', value: selectedRow?.id },
              { label: 'Type', value: selectedRow?.type },
              { label: 'Status', value: selectedRow?.status },
              {
                label: 'Contract Details',
                value: selectedRow?.contractId && (
                  <div className="space-y-2">
                    <div
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                      onClick={() => navigate(`/contracts/edit/${selectedRow?.contractId}`)}
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{selectedRow.contractId}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Click to view contract details
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
                className: 'col-span-2'
              },
              { 
                label: 'Buyer', 
                value: selectedRow?.buyer && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div className="text-gray-900">{selectedRow.buyer.name}</div>
                  </div>
                )
              },
              { 
                label: 'Seller', 
                value: selectedRow?.seller && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div className="text-gray-900">{selectedRow.seller.name}</div>
                  </div>
                )
              }
            ],
          },
          ...(selectedRow?.type === 'Supply' ? [{
            title: 'Routing',
            rows: [
              {
                label: 'Status',
                value: selectedRow.routingDetails ? (
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-green-600" />
                    <span>Routed</span>
                  </div>
                ) : selectedRow.status === 'cancelled' ? (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-gray-500" />
                    <span>Cannot route cancelled shipment</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Not routed</span>
                  </div>
                )
              },
              ...(selectedRow.routingDetails ? [
                {
                  label: 'Routed To',
                  value: (() => {
                    const salesContract = contractsStore.getById(selectedRow.routingDetails.routedToContractId);
                    return salesContract && (
                      <div className="space-y-2">
                        <div
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                          onClick={() => navigate(`/contracts/edit/${salesContract.id}`)}
                        >
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {salesContract.id}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Sales Contract • {salesContract.status}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Routed on {new Date(selectedRow.routingDetails.routedAt).toLocaleString()}
                        </div>
                      </div>
                    );
                  })()
                }
              ] : [])
            ]
          }] : []),
          {
            title: 'Documents',
            rows: [
              {
                label: 'Attachments',
                value: selectedRow?.documents?.length ? (
                  <div className="space-y-2">
                    {selectedRow.documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className={`
                          flex items-center justify-between p-3 rounded-lg border transition-colors duration-200 cursor-pointer
                          ${doc.type === 'sustainability_declaration'
                            ? 'bg-green-50 border-green-200 hover:bg-green-100'
                            : doc.type === 'bill_of_lading'
                              ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }
                        `}
                        onClick={() => handleViewDocument(doc)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <FileText className={`w-4 h-4 ${
                              doc.type === 'sustainability_declaration'
                                ? 'text-green-500'
                                : doc.type === 'bill_of_lading'
                                  ? 'text-blue-500'
                                  : 'text-gray-500'
                            }`} />
                            <div>
                              <div className={`text-sm font-medium ${
                                doc.type === 'sustainability_declaration'
                                  ? 'text-green-900'
                                  : doc.type === 'bill_of_lading'
                                    ? 'text-blue-900'
                                    : 'text-gray-900'
                              }`}>
                                {doc.type === 'sustainability_declaration'
                                  ? 'Sustainability Declaration'
                                  : doc.type === 'bill_of_lading'
                                    ? 'Bill of Lading'
                                    : doc.name
                                }
                              </div>
                              <div className={`text-xs ${
                                doc.type === 'sustainability_declaration'
                                  ? 'text-green-700'
                                  : doc.type === 'bill_of_lading'
                                    ? 'text-blue-700'
                                    : 'text-gray-500'
                              }`}>
                                {doc.name} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            icon={Trash2}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDocument(doc.id);
                            }}
                            className={`text-red-600 hover:text-red-700 ${
                              doc.type === 'sustainability_declaration'
                                ? 'hover:bg-green-200'
                                : doc.type === 'bill_of_lading'
                                  ? 'hover:bg-blue-200'
                                  : 'hover:bg-gray-200'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No documents uploaded</div>
                ),
                className: 'col-span-2'
              }
            ],
          },
          {
            title: 'Logistics',
            rows: [
              { 
                label: 'Terminal', 
                value: selectedRow?.terminal
              },
              { 
                label: 'Port', 
                value: selectedRow?.port
              },
              { 
                label: 'Country', 
                value: selectedRow?.country
              },
              { 
                label: 'Shipping Line', 
                value: selectedRow?.shippingLine
              },
              { 
                label: 'Departure Date', 
                value: selectedRow?.departureDate && new Date(selectedRow.departureDate).toLocaleDateString()
              },
              { 
                label: 'Arrival Date', 
                value: selectedRow?.arrivalDate && new Date(selectedRow.arrivalDate).toLocaleDateString()
              },
            ],
          },
          {
            
            title: 'Tanks',
            rows: [
              {
                label: 'Assigned Tanks',
                value: (() => {
                  const tanks = tankStore.getByShipmentId(selectedRow?.id);
                  const uniqueTanks = tanks.filter((tank, index, self) => 
                    index === self.findIndex(t => t.id === tank.id)
                  );
                  return uniqueTanks.length === 0 ? (
                    <div className="text-sm text-gray-500">No tanks assigned</div>
                  ) : (
                    <div className="space-y-3">
                      {uniqueTanks.map(tank => (
                        <div
                          key={tank.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                          onClick={() => navigate(`/tanks/edit/${tank.id}`)}
                        >
                          <div className="flex items-start gap-3">
                            <Container className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-900">{tank.id}</div>
                                <StatusBadge status={tank.status} size="sm" />
                              </div>
                              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="text-gray-500">Quantity</div>
                                  <div className="font-medium text-gray-900">
                                    {tank.quantity.toLocaleString()} MT
                                  </div>
                                </div>
                                {tank.quality && (
                                  <div>
                                    <div className="text-gray-500">Quality</div>
                                    <div className="flex items-center gap-2 text-xs">
                                      <span>FFA: {tank.quality.FFA}</span>
                                      <span>IV: {tank.quality.IV}</span>
                                      <span>S: {tank.quality.S}</span>
                                      <span>M&I: {tank.quality.MI}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })(),
                className: 'col-span-2'
              }
            ]
          },
          {
            title: 'Quality',
            rows: [
              {
                label: 'Shipment Quality',
                value: selectedRow?.quality ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">FFA:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedRow.quality.weightedAverageFFA.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">IV:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedRow.quality.weightedAverageIV.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">S:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedRow.quality.weightedAverageS.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">M&I:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedRow.quality.weightedAverageM1.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No quality data available</div>
                )
              }
            ]
          }
        ]}
      />
      
     {selectedRow && (
  <RouteDialog
    isOpen={showRouteDialog}
    onClose={() => setShowRouteDialog(false)} 
    shipmentId={selectedRow.id}
    onRoute={handleRoute}
  />
)}

{confirmDialog && <ConfirmDialog {...confirmDialog} />}

<DocumentViewer
  document={selectedDocument}
  onClose={handleCloseViewer}
/>

</div>  // <-- Close root div
);  // <-- Close return
}  // <-- Close component function