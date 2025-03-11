import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolve, setResolve] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    setOptions(options);
    setIsOpen(true);
    return new Promise((res) => setResolve(() => res));
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolve?.(true);
  }, [resolve]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolve?.(false);
  }, [resolve]);

  return {
    confirm,
    ConfirmDialog: options ? {
      isOpen,
      title: options.title || 'Confirm Action',
      message: options.message,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      isDanger: options.isDanger,
      onConfirm: handleConfirm,
      onCancel: handleCancel
    } : null
  };
}