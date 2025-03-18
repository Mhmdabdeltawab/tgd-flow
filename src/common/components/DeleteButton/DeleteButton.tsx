import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import Button from "../Button/Button";
import { useConfirm } from "../../hooks/useConfirm";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import { useToast } from "../../hooks/useToast";
import usePermissions from "../../hooks/usePermissions";

interface DeleteButtonProps {
  id: string;
  resourceType: string;
  onDelete: (id: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  checkPermission?: boolean;
}

export default function DeleteButton({
  id,
  resourceType,
  onDelete,
  disabled = false,
  className = "",
  size = "md",
  checkPermission = true,
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm, ConfirmDialog: ConfirmDialogProps } = useConfirm();
  const toast = useToast();
  const { canDelete, isAdmin } = usePermissions();

  // Check if user has permission to delete this resource type
  const hasPermission =
    !checkPermission || isAdmin() || canDelete(resourceType as any);

  if (!hasPermission) {
    console.log(`User does not have permission to delete ${resourceType}`);
    return null;
  }

  const handleDeleteClick = async () => {
    const confirmed = await confirm({
      title: `Delete ${resourceType}`,
      message: `Are you sure you want to delete this ${resourceType.toLowerCase()}? This action cannot be undone and all associated data will be permanently removed.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      isDanger: true,
    });

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await onDelete(id);
      toast.success(`${resourceType} deleted successfully`);
    } catch (error: any) {
      console.error(`Error deleting ${resourceType}:`, error);
      toast.error(error.message || `Failed to delete ${resourceType}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Size variants
  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <>
      {ConfirmDialogProps && <ConfirmDialog {...ConfirmDialogProps} />}
      <Button
        variant="secondary"
        onClick={handleDeleteClick}
        className={`inline-flex items-center ${sizeClasses[size]} text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
        disabled={disabled || isDeleting}
        aria-label={`Delete ${resourceType}`}
        data-testid={`delete-${resourceType.toLowerCase()}-${id}`}
      >
        {isDeleting ? (
          <>
            <div className="w-4 h-4 mr-2 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </>
        )}
      </Button>
    </>
  );
}
