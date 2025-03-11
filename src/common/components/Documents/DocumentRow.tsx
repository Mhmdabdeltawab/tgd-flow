import React from 'react';
import { FileCheck, FileWarning } from 'lucide-react';
import { Document } from '../../types';

export default function DocumentRow({ label, document, required }: Document) {
  const getDocumentStatus = () => {
    if (document) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <FileCheck className="w-4 h-4" />
          <span className="text-sm font-medium">Uploaded on {document.date}</span>
        </div>
      );
    }

    if (required) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <FileWarning className="w-4 h-4" />
          <span className="text-sm font-medium">Required - Not uploaded</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-gray-500">
        <FileWarning className="w-4 h-4" />
        <span className="text-sm font-medium">Not uploaded</span>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group cursor-pointer">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {required && (
          <span className="text-xs font-medium text-red-600">Required</span>
        )}
      </div>
      {getDocumentStatus()}
    </div>
  );
}