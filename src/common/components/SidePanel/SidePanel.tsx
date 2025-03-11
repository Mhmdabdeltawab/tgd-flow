import React from 'react';
import { X } from 'lucide-react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function SidePanel({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  actions,
  className,
}: SidePanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className={`${className || 'w-96'} transform transition-all ease-in-out duration-300`}>
          <div className="h-full flex flex-col bg-white shadow-xl">
            <div className="border-b border-gray-200">
              <div className="flex items-center justify-between px-8 py-5">
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <div className="flex items-center gap-4">
                  {actions}
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {description && (
              <div className="px-8 py-4 border-b border-gray-200">
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {children}
            </div>

            {footer && (
              <div className="flex items-center justify-between px-8 py-4 border-t border-gray-200">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}