import React from 'react';
import { X, Pencil, Trash2, ArrowRight, BadgeCheck } from 'lucide-react';
import SidePanel from '../SidePanel/SidePanel';
import StatusBadge from '../StatusBadge/StatusBadge';
import Button from '../Button/Button';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemId: string;
}

function DeleteConfirmation({ isOpen, onClose, onConfirm, itemId }: DeleteConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Confirmation</h3>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-medium text-gray-900">{itemId}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            className="!bg-red-600 hover:!bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

interface DetailsSectionProps {
  title: string;
  children: React.ReactNode;
}

function DetailsSection({ title, children }: DetailsSectionProps) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

interface DetailsRowProps {
  label: string;
  value: React.ReactNode;
  capacity?: {
    current: number;
    total?: number;
  };
  highlight?: boolean;
  className?: string;
}

function DetailsRow({ label, value, capacity, highlight = false, className = '' }: DetailsRowProps) {
  // Handle capacity display
  const renderCapacity = () => {
    if (!capacity) return value;
    
    if (!capacity.total) {
      return (
        <div className="flex items-center gap-2">
          <span>{capacity.current.toLocaleString()} MT</span>
          <span className="text-sm text-gray-500">(No capacity limit set)</span>
        </div>
      );
    }

    const utilization = (capacity.current / capacity.total) * 100;
    const utilizationColor = 
      utilization > 90 ? 'text-red-600' :
      utilization > 75 ? 'text-yellow-600' :
      'text-green-600';

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span>{capacity.current.toLocaleString()} MT</span>
          <span className="text-sm text-gray-500">of {capacity.total.toLocaleString()} MT</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                utilization > 90 ? 'bg-red-500' :
                utilization > 75 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
          <span className={`text-sm ${utilizationColor}`}>
            {utilization.toFixed(1)}% utilized
          </span>
        </div>
      </div>
    );
  };
  return (
    <div className={`
      py-3 px-4 rounded-lg border transition-colors duration-200
      ${highlight 
        ? 'bg-green-50 border-green-200 shadow-sm' 
        : 'bg-gray-50 border-transparent hover:bg-gray-100'
      }
      ${className}
    `}>
      <div className="text-xs text-gray-500 mb-1.5">{label}</div>
      <div className={`flex items-center text-sm font-medium ${highlight ? 'text-green-700' : 'text-gray-900'}`}>
        {highlight && <BadgeCheck className="w-4 h-4 mr-1.5 text-green-600" />}
        {capacity ? renderCapacity() : value}
      </div>
    </div>
  );
}

interface DetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onEdit?: () => void;
  onDelete?: () => void;
  sections: {
    title: string;
    rows: {
      label: string;
      value: React.ReactNode;
    }[];
  }[];
  relatedItems?: {
    title: string;
    items: {
      id: string;
      title: string;
      subtitle?: string;
      status?: string;
      onClick?: () => void;
    }[];
  }[];
}

export default function DetailsPanel({
  isOpen,
  onClose,
  title,
  sections,
  onEdit,
  onDelete,
  relatedItems,
}: DetailsPanelProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  const formatCapacityInfo = (row: any) => {
    if (!row.capacity) {
      return (
        <div className="flex items-center gap-2 text-gray-500">
          <span>Capacity not set</span>
        </div>
      );
    }

    const quantity = row.quantity || 0;
    const utilization = (quantity / row.capacity) * 100;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-900">{row.capacity.toLocaleString()} MT</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                utilization > 90 ? 'bg-red-500' :
                utilization > 75 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
          <span className="text-sm text-gray-500">
            {utilization.toFixed(1)}% utilized
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <SidePanel
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        className="w-[640px]"
        actions={
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="secondary"
                icon={Pencil}
                onClick={onEdit}
                className="px-4 py-2 text-indigo-600 hover:text-indigo-700 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="secondary"
                icon={Trash2}
                onClick={handleDelete}
                className="px-4 py-2 !text-red-600 hover:!text-red-700 !border-red-200 hover:!border-red-300 hover:!bg-red-50"
              >
                Delete
              </Button>
            )}
          </div>
        }
      >
        <div className="overflow-y-auto overscroll-contain h-full custom-scrollbar">
          {/* Main Details */}
          <div className="bg-white">
            {sections.map((section, index) => (
              <div key={index} className="px-8 py-6 border-b border-gray-100 last:border-b-0">
                <DetailsSection title={section.title}>
                  <div className="grid grid-cols-2 gap-3">
                    {section.rows.map((row, rowIndex) => (
                      <DetailsRow
                        key={rowIndex}
                        label={row.label}
                        value={row.value}
                        highlight={row.highlight || row.label === 'ISCC Number'}
                        className={row.label === 'Contract Documents' ? 'col-span-2' : ''}
                      />
                    ))}
                  </div>
                </DetailsSection>
              </div>
            ))}
          </div>

          {/* Related Items List */}
          {relatedItems?.map((group, groupIndex) => (
            <div key={groupIndex} className="px-8 py-6 border-t border-gray-100 bg-white">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                {group.title}
              </h3>
              {group.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 mb-2 last:mb-0 group border border-gray-200"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {item.title}
                      </span>
                      {item.status && (
                        <StatusBadge status={item.status} />
                      )}
                    </div>
                    {item.subtitle && (
                      <span className="text-xs text-gray-500 mt-1 block">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
              ))}
            </div>
          ))}
        </div>
      </SidePanel>

      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        itemId={sections[0]?.rows.find(row => row.label === 'ID')?.value?.toString() || ''}
      />
    </>
  );
}