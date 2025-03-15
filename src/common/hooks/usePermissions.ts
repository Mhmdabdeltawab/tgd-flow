import { useCallback } from "react";
import useSupabaseAuthStore from "../stores/supabaseAuthStore";

type ResourceType = keyof ReturnType<
  typeof useSupabaseAuthStore
>["user"]["permissions"];

const usePermissions = () => {
  const { user } = useSupabaseAuthStore();

  const canView = useCallback(
    (resource: ResourceType): boolean => {
      if (!user) return false;
      return user.permissions[resource]?.view || false;
    },
    [user],
  );

  const canEdit = useCallback(
    (resource: ResourceType): boolean => {
      if (!user) return false;
      return user.permissions[resource]?.edit || false;
    },
    [user],
  );

  const canDelete = useCallback(
    (resource: ResourceType): boolean => {
      if (!user) return false;
      return user.permissions[resource]?.delete || false;
    },
    [user],
  );

  const isAdmin = useCallback((): boolean => {
    if (!user) return false;
    return user.role === "admin";
  }, [user]);

  return {
    canView,
    canEdit,
    canDelete,
    isAdmin,
  };
};

export default usePermissions;
