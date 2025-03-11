import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import Button from '../Button/Button';
import PageHeader from '../PageHeader/PageHeader';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { useConfirm } from '../../hooks/useConfirm';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';

interface FormPageProps {
  title: string;
  description?: string;
  backTo: string;
  onSave: () => void;
  onCancel: () => void;
  isDirty?: boolean;
  isSubmitting?: boolean;
  children: React.ReactNode;
}

export default function FormPage({
  title,
  description,
  backTo,
  onSave,
  onCancel,
  isDirty = false,
  isSubmitting = false,
  children,
}: FormPageProps) {
  const navigate = useNavigate();
  const { confirm, ConfirmDialog: confirmDialog } = useConfirm();
  const { handleNavigate } = useUnsavedChanges({ 
    isDirty,
    onConfirm: onCancel 
  });

  const handleCancel = async () => {
    if (isDirty) {
      const confirmed = await confirm({
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmLabel: 'Discard',
        cancelLabel: 'Keep Editing',
        isDanger: true
      });

      if (confirmed) {
        onCancel();
        navigate(backTo);
      }
    } else {
      onCancel();
      navigate(backTo);
    }
  };

  const handleBack = () => {
    handleNavigate(backTo);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={X}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={Save} 
              onClick={onSave}
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={handleBack}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        {children}
      </div>

      {confirmDialog && <ConfirmDialog {...confirmDialog} />}
    </div>
  );
}