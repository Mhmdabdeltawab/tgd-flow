import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnsavedChanges } from './useUnsavedChanges';
import { useError } from '../services/errorService';

export interface FormConfig<T> {
  initialData: T;
  onSubmit: (data: T) => Promise<void>;
  validate?: (data: T) => Record<keyof T, string | undefined>;
  backTo: string;
}

export function useForm<T extends Record<string, any>>({
  initialData,
  onSubmit,
  validate,
  backTo,
}: FormConfig<T>) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleError } = useError();

  const { handleNavigate } = useUnsavedChanges({
    isDirty,
    onConfirm: () => {
      setIsDirty(false);
      setErrors({});
    }
  });

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialData);
    setIsDirty(false);
    setErrors({});
  }, [initialData]);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // Clear error when field is modified
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // Custom validation
      if (validate) {
        const validationErrors = validate(formData);
        const hasErrors = Object.values(validationErrors).some(error => error !== undefined);
        if (hasErrors) {
          setErrors(validationErrors);
          setIsSubmitting(false);
          return;
        }
      }

      // Submit form
      await onSubmit(formData);
      setIsDirty(false);
      setIsSubmitting(false);
      navigate(backTo);
    } catch (error) {
      handleError(error);
      setErrors(prev => ({
        ...prev,
        submit: 'An error occurred while saving. Please try again.',
      }));
      setIsSubmitting(false);
    }
  }, [formData, validate, onSubmit, navigate, backTo, handleError]);

  const handleCancel = useCallback(() => {
    // Reset form state
    setFormData(initialData);
    setIsDirty(false);
    setErrors({});
    
    handleNavigate(backTo);
  }, [handleNavigate, backTo, initialData]);

  return {
    formData,
    errors,
    isDirty,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleCancel,
    setErrors,
  };
}