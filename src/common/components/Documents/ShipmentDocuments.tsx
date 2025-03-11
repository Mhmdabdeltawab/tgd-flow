import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import { DocumentType, ShipmentDocument, BLStatus } from '../../types/shipment';

interface ShipmentDocumentsProps {
  blDocuments?: ShipmentDocument[];
  otherDocuments?: ShipmentDocument[];
  onUploadBL: (file: File) => void;
  onUploadOther: (file: File, type: DocumentType) => void;
  onUpdateBLStatus: (documentId: string, status: BLStatus) => void;
  onDelete: (documentId: string) => void;
}

export default function ShipmentDocuments({
  blDocuments = [], // Default empty array
  otherDocuments = [], // Default empty array
  onUploadBL,
  onUploadOther,
  onUpdateBLStatus,
  onDelete
}: ShipmentDocumentsProps) {
  const [selectedDocType, setSelectedDocType] = React.useState<DocumentType>('sustainability_declaration');

  const documentTypes: { value: DocumentType; label: string }[] = [
    { value: 'sustainability_declaration', label: 'Sustainability Declaration' },
    { value: 'packing_list', label: 'Packing List' },
    { value: 'insurance_certificate', label: 'Insurance Certificate' }
  ];

  return (
    <div className="space-y-8">
      {/* BL Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Bill of Lading</h3>
        <div className="space-y-4">
          <DocumentUpload 
            onUpload={onUploadBL}
            accept=".pdf,.jpg,.jpeg,.png"
            maxSize={10 * 1024 * 1024} // 10MB
          />

          {blDocuments.length === 0 ? (
            <div className="flex items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No Bill of Lading documents uploaded yet</p>
                <p className="text-xs text-gray-400 mt-1">Upload a document to get started</p>
              </div>
            </div>
          ) : (
            blDocuments.map(doc => (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                    <div className="text-xs text-gray-500">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={doc.status}
                    onChange={(e) => onUpdateBLStatus(doc.id, e.target.value as BLStatus)}
                    className="text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="loaded">Loaded</option>
                    <option value="delivered">Delivered</option>
                  </select>

                  <button
                    onClick={() => onDelete(doc.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <span className="sr-only">Delete</span>
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Other Documents Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Other Documents</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
              className="flex-1 text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <DocumentUpload 
              onUpload={(file) => onUploadOther(file, selectedDocType)}
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={10 * 1024 * 1024} // 10MB
            />
          </div>

          {otherDocuments.length === 0 ? (
            <div className="flex items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No additional documents uploaded yet</p>
                <p className="text-xs text-gray-400 mt-1">Select a document type and upload to add</p>
              </div>
            </div>
          ) : (
            otherDocuments.map(doc => {
              const docType = documentTypes.find(t => t.value === doc.type);
              
              return (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {docType?.label || doc.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {doc.name} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.type === 'sustainability_declaration' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <span className="sr-only">Delete</span>
                      <AlertTriangle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}