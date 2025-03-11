import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBeforeUnload } from './useBeforeUnload';
import { useConfirm } from './useConfirm';

interface UseUnsavedChangesConfig {
  isDirty: boolean;
  message?: string;
  onConfirm?: () => void;
}

export function useUnsavedChanges({
  isDirty,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  onConfirm,
}: UseUnsavedChangesConfig) {
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  // Prevent browser's default confirmation dialog
  useBeforeUnload(isDirty);

  // Handle programmatic navigation
  const handleNavigate = useCallback(async (to: string) => {
    const confirmNavigation = () => {
      onConfirm?.();
      navigate(to);
    };

    if (isDirty) {
      const confirmed = await confirm({
        title: 'Unsaved Changes',
        message,
        confirmLabel: 'Leave',
        cancelLabel: 'Stay',
        isDanger: true
      });

      if (confirmed) {
        confirmNavigation();
      }
    } else {
      confirmNavigation();
    }
  }, [isDirty, message, navigate, onConfirm, confirm]);

  return {
    handleNavigate,
  };
}