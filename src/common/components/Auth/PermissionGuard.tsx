import React from "react";
import usePermissions from "../../hooks/usePermissions";

type PermissionType = "view" | "edit" | "delete";

interface PermissionGuardProps {
  resource: Parameters<ReturnType<typeof usePermissions>["canView"]>[0];
  permission?: PermissionType;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  permission = "view",
  fallback = null,
  children,
}) => {
  const { canView, canEdit, canDelete } = usePermissions();

  const hasPermission = (() => {
    switch (permission) {
      case "view":
        return canView(resource);
      case "edit":
        return canEdit(resource);
      case "delete":
        return canDelete(resource);
      default:
        return false;
    }
  })();

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
