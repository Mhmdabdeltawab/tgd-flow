import React from 'react';
import { X } from 'lucide-react';
import { Document, DocumentType } from '../../types/document';

interface DocumentViewerProps {
  document: Document | null;
  onClose: () => void;
}

const getDocumentLabel = (type: DocumentType) => {
  switch (type) {
    case 'sustainability_declaration':
      return 'Sustainability Declaration';
    case 'bill_of_lading':
      return 'Bill of Lading';
    default:
      return 'Document';
  }
};

export default function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-500 bg-opacity-75">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-4xl">
              <div className="flex h-full flex-col bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div>
                    <h2 className={`text-lg font-semibold ${
                      document.type === 'sustainability_declaration'
                        ? 'text-green-900'
                        : document.type === 'bill_of_lading'
                          ? 'text-blue-900'
                          : 'text-gray-900'
                    }`}>
                      {getDocumentLabel(document.type)}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Uploaded on {new Date(document.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="relative flex-1 px-6 py-6 overflow-auto">
                  {document.content ? (
                    document.name.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={document.content}
                        className="w-full h-full min-h-[600px]"
                        title={document.name}
                      />
                    ) : document.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={document.content}
                      alt={document.name}
                      className="max-w-full h-auto"
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">
                        Preview not available for this file type
                      </p>
                    </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">
                        Document content not available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}