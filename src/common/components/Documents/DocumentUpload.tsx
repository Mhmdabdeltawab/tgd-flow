import React from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import Button from '../Button/Button';
import { DocumentType } from '../../types/document';

interface DocumentUploadProps {
  onUpload: (file: File) => void;
  maxSize?: number; // in bytes
  accept?: string;
  multiple?: boolean;
  type?: DocumentType;
  label?: string;
}

export default function DocumentUpload({ 
  onUpload, 
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = '.pdf,.doc,.docx',
  multiple = false,
  type = 'other',
  label
}: DocumentUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    // Validate file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = accept.split(',').map(type => 
      type.trim().replace('.', '').toLowerCase()
    );
    
    if (!acceptedTypes.includes(fileType || '')) {
      setError(`File type must be: ${accept}`);
      return;
    }

    onUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6
          ${dragActive 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          transition-colors duration-200
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-3 bg-gray-100 rounded-full">
            <Upload className="w-6 h-6 text-gray-600" />
          </div>
          <div className="text-sm text-center">
            <span className="font-medium text-indigo-600">Click to upload</span>
            {' '}or drag and drop
            {type === 'bill_of_lading' && (
              <p className="text-gray-400 mt-1">(Optional)</p>
            )}
            {type === 'bill_of_lading' && (
              <p className="text-gray-400 mt-1">(Optional)</p>
            )}
            <p className="text-gray-500 mt-1">
              {accept.split(',').join(', ')} up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}