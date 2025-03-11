import React from 'react';
import { FileText, Trash2, Eye } from 'lucide-react';
import Button from '../Button/Button';
import { Document, DocumentType } from '../../types/document';

interface DocumentListProps {
  documents: Document[];
  onDelete: (documentId: string) => void;
  onView: (document: Document) => void;
  type?: DocumentType;
}

export default function DocumentList({ documents, onDelete, onView, type }: DocumentListProps) {
  // Filter out duplicates by ID
  const uniqueDocuments = React.useMemo(() => {
    const seen = new Set();
    return documents.filter(doc => {
      if (seen.has(doc.id)) {
        return false;
      }
      seen.add(doc.id);
      return true;
    });
  }, [documents]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentLabel = (doc: Document) => {
    switch (doc.type) {
      case 'sustainability_declaration':
        return 'Sustainability Declaration';
      case 'bill_of_lading':
        return 'Bill of Lading';
      default:
        return doc.name;
    }
  };

  // Filter documents by type if specified
  const filteredDocuments = type ? uniqueDocuments.filter(doc => doc.type === type) : uniqueDocuments;
  return (
    <div className="space-y-2">
      {filteredDocuments.map((doc) => (
        <div
          key={doc.id}
          className={`
            flex items-center justify-between p-3 rounded-lg border transition-colors duration-200
            ${doc.type === 'sustainability_declaration'
              ? 'bg-green-50 border-green-200 hover:bg-green-100'
              : doc.type === 'bill_of_lading'
                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <FileText className={`w-5 h-5 ${
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
                {getDocumentLabel(doc)}
              </div>
              <div className={`text-xs mt-0.5 ${
                doc.type === 'sustainability_declaration'
                  ? 'text-green-700'
                  : doc.type === 'bill_of_lading'
                    ? 'text-blue-700'
                    : 'text-gray-500'
              }`}>
                {formatFileSize(doc.size)} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              icon={Eye}
              onClick={() => onView(doc)}
              className={`
                ${doc.type === 'sustainability_declaration'
                  ? 'text-green-600 hover:text-green-900'
                  : doc.type === 'bill_of_lading'
                    ? 'text-blue-600 hover:text-blue-900'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            />
            <Button
              variant="ghost"
              icon={Trash2}
              onClick={() => onDelete(doc.id)}
              className="text-red-600 hover:text-red-700"
            />
          </div>
        </div>
      ))}
    </div>
  );
}