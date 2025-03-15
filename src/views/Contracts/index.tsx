import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileDown,
  FileUp,
  Share2,
  Printer,
  AlertCircle,
  BadgeCheck,
  AlertTriangle,
  FileText,
  Ship,
} from "lucide-react";
import StatusBadge from "../../common/components/StatusBadge/StatusBadge";
import ImportDialog from "../../common/components/Import/ImportDialog";
import DocumentViewer from "../../common/components/Documents/DocumentViewer";
import Table from "../../common/components/Table/Table";
import TableToolbar from "../../common/components/Table/TableToolbar";
import FiltersSidebar from "../../common/components/Filters/FiltersSidebar";
import ColumnsSidebar from "../../common/components/Table/ColumnsSidebar";
import PageHeader from "../../common/components/PageHeader/PageHeader";
import Button from "../../common/components/Button/Button";
import { useDataTable } from "../../common/hooks/useDataTable";
import { Column } from "../../common/components/Table/ColumnsSidebar";
import DetailsPanel from "../../common/components/DetailsPanel/DetailsPanel";
import { useExport, ExportFormat } from "../../common/hooks/useExport";
import { usePrint } from "../../common/hooks/usePrint";
import { useShare } from "../../common/hooks/useShare";
import { getPortByName } from "../../common/data/ports";
import { useImport } from "../../common/hooks/useImport";
import { useConfirm } from "../../common/hooks/useConfirm";
import ConfirmDialog from "../../common/components/ConfirmDialog/ConfirmDialog";
import { contractsStore } from "../../common/stores/contractsStore";
import { partyStore } from "../../common/stores/partyStore";
import { documentStore } from "../../common/stores/documentStore";
import { shipmentStore } from "../../common/stores/shipmentStore";
import { Document } from "../../common/types/document";

const defaultColumns: Column[] = [
  { key: "id", header: "ID", width: "180px" },
  { key: "externalReferenceId", header: "EXT. REF ID", width: "150px" },
  {
    key: "type",
    header: "TYPE",
    width: "120px",
    render: (row: any) => <StatusBadge status={row.type} size="sm" />,
  },
  {
    key: "status",
    header: "STATUS",
    width: "120px",
    render: (row: any) => <StatusBadge status={row.status} size="sm" />,
  },
  { key: "buyerName", header: "BUYER", width: "180px" },
  { key: "sellerName", header: "SELLER", width: "180px" },
  {
    key: "broker.name",
    header: "BROKER",
    width: "150px",
    render: (row: any) => <span>{row.broker?.name || "N/A"}</span>,
  },
  {
    key: "broker.fees",
    header: "BROKER FEES",
    width: "120px",
    render: (row: any) => (
      <span>
        {row.broker?.fees ? `${row.currency} ${row.broker.fees}` : "N/A"}
      </span>
    ),
  },
  { key: "productType", header: "PRODUCT", width: "120px" },
  { key: "incoterm", header: "INCOTERM", width: "100px" },
  { key: "quantity", header: "QUANTITY", width: "100px" },
  { key: "allowedVariance", header: "VARIANCE", width: "100px" },
  { key: "unitPrice", header: "UNIT PRICE", width: "120px" },
  { key: "currency", header: "CURRENCY", width: "100px" },
  { key: "paymentTerms", header: "PAYMENT", width: "120px" },
  { key: "qualityFFA", header: "FFA", width: "80px" },
  { key: "qualityIV", header: "IV", width: "80px" },
  { key: "qualityS", header: "S", width: "80px" },
  { key: "qualityM1", header: "M&I", width: "80px" },
  { key: "packingStandard", header: "PACKING", width: "120px" },
  { key: "originCountry", header: "ORIGIN", width: "120px" },
  { key: "deliveryCountry", header: "DELIVERY", width: "120px" },
  { key: "deliveryPort", header: "PORT", width: "120px" },
  { key: "loadingStartDate", header: "LOADING START DATE", width: "160px" },
  { key: "loadingPeriod", header: "LOADING PERIOD (DAYS)", width: "180px" },
  {
    key: "loadingDuration",
    header: "LOADING DURATION",
    width: "150px",
    render: (row: any) => (
      <span className="capitalize">{row.loadingDuration || "N/A"}</span>
    ),
  },
  { key: "deliveryDate", header: "DELIVERY DATE", width: "140px" },
];

export default function ContractsPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = React.useState(contractsStore.getAll());
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [isColumnsOpen, setIsColumnsOpen] = React.useState(false);
  const [selectedDocument, setSelectedDocument] = React.useState<any>(null);
  const { confirm, ConfirmDialog: confirmDialog } = useConfirm();
  const [isImportOpen, setIsImportOpen] = React.useState(false);

  const { importData, downloadTemplate, isImporting, progress } = useImport(
    "contracts",
    async (data) => {
      await contractsStore.create(data);
    },
  );

  const handleImport = async (file: File) => {
    try {
      await importData(file);
      setContracts(contractsStore.getAll());
    } finally {
      if (!isImporting) {
        setIsImportOpen(false);
      }
    }
  };

  // Function to check if a contract has missing documents
  const hasMissingDocuments = (contract: any) => {
    return !contract.documents || Object.keys(contract.documents).length === 0;
  };

  // Filter contracts with missing documents
  const contractsWithMissingDocs = React.useMemo(() => {
    return contracts.filter(hasMissingDocuments);
  }, [contracts]);

  // Count of contracts with missing documents
  const pendingReviewCount = contractsWithMissingDocs.length;

  // Handle Review Pending click
  const handleReviewPendingClick = () => {
    // Filter the table to show only contracts with missing documents
    const missingDocsIds = contractsWithMissingDocs.map(
      (contract) => contract.id,
    );
    if (missingDocsIds.length > 0) {
      setSearchQuery(""); // Clear any existing search
      const missingDocsFilter = createFilterGroup(
        "missingDocs",
        "Missing Documents",
        missingDocsIds,
      );
      missingDocsFilter.selectedItems = missingDocsIds;
    }
  };

  const { exportData, isExporting } = useExport(contracts);
  const { printData } = usePrint(contracts);
  const { shareData } = useShare(contracts);

  // Refresh contracts when they change in localStorage
  React.useEffect(() => {
    const handleStorageChange = () => {
      setContracts(contractsStore.getAll());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
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
    data: contracts,
    defaultColumns,
    pageId: "contracts",
    searchFields: ["id", "type", "status", "buyerId", "sellerId"],
    initialFilters: {
      type: [],
    },
  });

  const filterGroups = [
    createFilterGroup("type", "Contract Type", ["Supply", "Sales"]),
    createFilterGroup("status", "Status", ["opened", "pending", "closed"]),
    createFilterGroup(
      "productType",
      "Product Type",
      Array.from(new Set(contracts.map((c) => c.productType))),
    ),
    createFilterGroup(
      "originCountry",
      "Origin Country",
      Array.from(new Set(contracts.map((c) => c.originCountry))),
    ),
    createFilterGroup(
      "deliveryCountry",
      "Delivery Country",
      Array.from(new Set(contracts.map((c) => c.deliveryCountry))),
    ),
    createFilterGroup("missingDocs", "Missing Documents", []),
  ];

  const handleRowClick = (row: any) => {
    // Get buyer and seller details including ISCC info
    const buyer = row.buyerId
      ? partyStore.getById("buyers", row.buyerId)
      : null;
    const seller = row.sellerId
      ? partyStore.getById("suppliers", row.sellerId)
      : null;

    // Get documents
    const documents = documentStore.getByEntityId(row.id);

    // Get shipments for this contract
    const shipments = shipmentStore.getByContractId(row.id) || [];

    // Enhance row data with ISCC and documents
    const enhancedRow = {
      ...row,
      buyerIscc: buyer?.isccNumber || null,
      buyerIsccExpiry: buyer?.isccExpiry || null,
      sellerIscc: seller?.isccNumber || null,
      sellerIsccExpiry: seller?.isccExpiry || null,
      documents,
      shipments,
    };

    setSelectedRow(enhancedRow);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Contract",
      message:
        "Are you sure you want to delete this contract? This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      isDanger: true,
    });

    if (confirmed) {
      contractsStore.delete(id);
      setContracts(contractsStore.getAll());
      setSelectedRow(null);
    }
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleCloseViewer = () => {
    setSelectedDocument(null);
  };

  return (
    <div>
      <PageHeader
        title="Contracts"
        description="Manage and track all contract details"
        actions={
          <Button variant="primary" onClick={() => navigate("/contracts/new")}>
            New Contract
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
          searchPlaceholder="Search contracts by ID, type, status..."
          mainAction={{
            icon: AlertCircle,
            label: "Review Pending",
            onClick: handleReviewPendingClick,
            badge: pendingReviewCount,
            className:
              "!bg-amber-50 !text-amber-700 !border-amber-200 hover:!bg-amber-100 hover:!border-amber-300",
          }}
          secondaryActions={[
            {
              icon: FileDown,
              label: "Export",
              onClick: () =>
                exportData({
                  filename: `contracts-${new Date().toISOString().split("T")[0]}`,
                  format: "csv",
                  columns: visibleColumns.map((col) => col.key),
                }),
              variant: "ghost",
            },
            {
              icon: FileUp,
              label: "Import",
              onClick: () => setIsImportOpen(true),
              variant: "ghost",
            },
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
        title="Contract Details"
        onEdit={() => navigate(`/contracts/edit/${selectedRow?.id}`)}
        onDelete={() => handleDelete(selectedRow?.id)}
        sections={[
          {
            title: "Contract Details",
            rows: [
              {
                label: "Type",
                value: selectedRow?.type,
              },
              {
                label: "Status",
                value: selectedRow?.status,
              },
              {
                label: "External Reference ID",
                value: selectedRow?.externalReferenceId || "N/A",
              },
              {
                label: "Broker",
                value: selectedRow?.broker?.name ? (
                  <div>
                    <div>{selectedRow.broker.name}</div>
                    <div className="text-sm text-gray-500">
                      Fees:{" "}
                      {selectedRow.broker.fees
                        ? `${selectedRow.currency} ${selectedRow.broker.fees}`
                        : "N/A"}
                    </div>
                  </div>
                ) : (
                  "N/A"
                ),
              },

              {
                label: "Buyer",
                value: (
                  <div className="space-y-1">
                    <div>{selectedRow?.buyerName}</div>
                    <div
                      className={`flex items-center gap-1.5 text-xs ${
                        selectedRow?.buyerIscc
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      {selectedRow?.buyerIscc ? (
                        <>
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <div>
                            <div>ISCC: {selectedRow.buyerIscc}</div>
                            <div>
                              Expires:{" "}
                              {new Date(
                                selectedRow.buyerIsccExpiry,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          ISCC: Missing
                        </>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                label: "Seller",
                value: (
                  <div className="space-y-1">
                    <div>{selectedRow?.sellerName}</div>
                    <div
                      className={`flex items-center gap-1.5 text-xs ${
                        selectedRow?.sellerIscc
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      {selectedRow?.sellerIscc ? (
                        <>
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <div>
                            <div>ISCC: {selectedRow.sellerIscc}</div>
                            <div>
                              Expires:{" "}
                              {new Date(
                                selectedRow.sellerIsccExpiry,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          ISCC: Missing
                        </>
                      )}
                    </div>
                  </div>
                ),
              },
              { label: "Product Type", value: selectedRow?.productType },
              { label: "Incoterm", value: selectedRow?.incoterm },
            ],
          },
          // Only show Documents section if there are documents
          ...(selectedRow?.documents?.length > 0
            ? [
                {
                  title: "Documents",
                  rows: [
                    {
                      label: "Attachments",
                      value: (
                        <div className="space-y-2">
                          {selectedRow.documents.map((doc: any) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                              onClick={() => handleViewDocument(doc)}
                              role="button"
                              tabIndex={0}
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {doc.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Uploaded{" "}
                                    {new Date(
                                      doc.uploadedAt,
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ),
                      className: "col-span-2",
                    },
                  ],
                },
              ]
            : []),
          {
            title: "Commercial Terms",
            rows: [
              { label: "Quantity", value: selectedRow?.quantity },
              {
                label: "Allowed Variance",
                value: `${selectedRow?.allowedVariance}%`,
              },
              {
                label: "Unit Price",
                value: `${selectedRow?.currency} ${selectedRow?.unitPrice}`,
              },
              { label: "Payment Terms", value: selectedRow?.paymentTerms },
              {
                label: "Packing Standard",
                value: selectedRow?.packingStandard,
              },
            ],
          },
          {
            title: "Quality Parameters",
            rows: [
              { label: "FFA", value: selectedRow?.quality?.weightedAverageFFA },
              { label: "IV", value: selectedRow?.quality?.weightedAverageIV },
              { label: "S", value: selectedRow?.quality?.weightedAverageS },
              { label: "M&I", value: selectedRow?.quality?.weightedAverageM1 },
            ],
          },
          {
            title: "Logistics",
            rows: [
              { label: "Origin Country", value: selectedRow?.originCountry },
              {
                label: "Delivery Country",
                value: selectedRow?.deliveryCountry,
              },
              {
                label: "Delivery Port",
                value: selectedRow?.deliveryPort && (
                  <div className="flex items-center gap-2">
                    <Ship className="w-4 h-4 text-gray-500" />
                    <span>{selectedRow.deliveryPort}</span>
                    <span className="text-gray-500">
                      ({getPortByName(selectedRow.deliveryPort)?.country})
                    </span>
                  </div>
                ),
              },
              {
                label: "Loading Start Date",
                value: new Date(
                  selectedRow?.loadingStartDate,
                ).toLocaleDateString(),
              },
              {
                label: "Loading Period",
                value: `${selectedRow?.loadingPeriod} days`,
              },
              {
                label: "Loading Duration",
                value: selectedRow?.loadingDuration
                  ? selectedRow.loadingDuration.charAt(0).toUpperCase() +
                    selectedRow.loadingDuration.slice(1)
                  : "N/A",
              },
              {
                label: "Delivery Date",
                value: new Date(selectedRow?.deliveryDate).toLocaleDateString(),
              },
            ],
          },
        ]}
        relatedItems={[
          {
            title: `Shipments (${selectedRow?.shipments?.length || 0})`,
            items:
              (selectedRow?.shipments || []).map((shipment) => ({
                id: shipment.id,
                title: shipment.id,
                subtitle: `${shipment.quantity.toLocaleString()} MT • ${shipment.shippingLine}`,
                status: shipment.status,
                onClick: () => navigate(`/shipments/edit/${shipment.id}`),
              })) || [],
          },
          {
            title: "Tanks (1)",
            items: [
              {
                id: "TNK-250204-031",
                title: "TNK-250204-031",
                subtitle: "FLEX1",
                status: "discharged",
                onClick: () => console.log("Navigate to tank"),
              },
            ],
          },
        ]}
      />

      <DocumentViewer document={selectedDocument} onClose={handleCloseViewer} />

      {confirmDialog && <ConfirmDialog {...confirmDialog} />}

      <ImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
        onDownloadTemplate={downloadTemplate}
        isImporting={isImporting}
        progress={progress}
      />
    </div>
  );
}
