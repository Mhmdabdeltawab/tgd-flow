import React from 'react';
import { X, Upload, FileDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Button from '../Button/Button';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<any>;
  onDownloadTemplate: () => void;
  isImporting: boolean;
  progress: {
    total: number;
    current: number;
    successful: number;
    warnings: number;
    failed: number;
  } | null;
}

export default function ImportDialog({
  isOpen,
  onClose,
  onImport,
  onDownloadTemplate,
  isImporting,
  progress
}: ImportDialogProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await onImport(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await onImport(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Import Contracts</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {!isImporting ? (
              <>
                {/* Upload Area */}
                <div
                  className={`
                    relative border-2 border-dashed rounded-lg p-6 mb-4
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
                    accept=".csv,.xlsx,.xls"
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
                      <p className="text-gray-500 mt-1">
                        CSV, Excel files
                      </p>
                    </div>
                  </div>
                </div>

                {/* Template Download */}
                <div className="flex items-center justify-center">
                  <Button
                    variant="ghost"
                    icon={FileDown}
                    onClick={onDownloadTemplate}
                    className="text-gray-600"
                  >
                    Download Template
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Import Progress */}
                {progress && (
                  <div className="space-y-4">
                    <div className="relative pt-1">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 transition-all duration-200"
                          style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="text-sm font-medium text-green-700">
                            Successful
                          </div>
                          <div className="text-xs text-green-600">
                            {progress.successful}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <div>
                          <div className="text-sm font-medium text-yellow-700">
                            Warnings
                          </div>
                          <div className="text-xs text-yellow-600">
                            {progress.warnings}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <div>
                          <div className="text-sm font-medium text-red-700">
                            Failed
                          </div>
                          <div className="text-xs text-red-600">
                            {progress.failed}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-center text-gray-500">
                      Processing {progress.current} of {progress.total} contracts...
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}