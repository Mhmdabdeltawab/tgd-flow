import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../Button/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = false
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
        onClick={onCancel}
      />

      {/* Center container */}
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          {/* Dialog */}
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                {/* Icon */}
                <div className={`
                  mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10
                  ${isDanger ? 'bg-red-100' : 'bg-yellow-100'}
                `}>
                  <AlertTriangle className={`
                    h-6 w-6
                    ${isDanger ? 'text-red-600' : 'text-yellow-600'}
                  `} />
                </div>

                {/* Content */}
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    {title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <Button
                variant="primary"
                onClick={onConfirm}
                className={`w-full sm:ml-3 sm:w-auto ${
                  isDanger 
                    ? '!bg-red-600 hover:!bg-red-700 focus:!ring-red-500' 
                    : '!bg-yellow-600 hover:!bg-yellow-700 focus:!ring-yellow-500'
                }`}
              >
                {confirmLabel}
              </Button>
              <Button
                variant="secondary"
                onClick={onCancel}
                className="mt-3 w-full sm:mt-0 sm:w-auto"
              >
                {cancelLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}