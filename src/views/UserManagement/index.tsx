import React, { useState } from "react";
import PageHeader from "../../common/components/PageHeader/PageHeader";
import { UserPlus, RefreshCw, Plus } from "lucide-react";
import Button from "../../common/components/Button/Button";
import Search from "../../common/components/Search/Search";
import UserManagementTable from "./UserManagementTable";
import UserAddForm from "./UserAddForm";
import UserFormModal from "./UserFormModal";
import useUserManagement from "../../common/hooks/useUserManagement";
import { useConfirm } from "../../common/hooks/useConfirm";
import ConfirmDialog from "../../common/components/ConfirmDialog/ConfirmDialog";
import { useToast } from "../../common/hooks/useToast";
import useSupabaseAuthStore from "../../common/stores/supabaseAuthStore";

const UserManagement: React.FC = () => {
  const { confirm, ConfirmDialog: ConfirmDialogProps } = useConfirm();
  const toast = useToast();
  const {
    users,
    loading,
    newUserEmail,
    setNewUserEmail,
    newUserRole,
    setNewUserRole,
    isAddingUser,
    setIsAddingUser,
    editingUser,
    editedPermissions,
    searchTerm,
    setSearchTerm,
    currentUser,
    handleAddUser,
    startEditingUser,
    cancelEditingUser,
    saveUserPermissions,
    updatePermission,
    fetchUsers,
  } = useUserManagement();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const handleAddUserSubmit = async () => {
    setIsSubmitting(true);
    try {
      await handleAddUser();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (currentUser?.id === userId) {
      toast.error("You cannot delete your own account");
      return;
    }

    setDeletingUserId(userId);
    try {
      // Access deleteUser directly from useSupabaseAuthStore
      const deleteUser = useSupabaseAuthStore.getState().deleteUser;
      await deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  const permissionSections = [
    { key: "dashboard" as const, label: "Dashboard" },
    { key: "contracts" as const, label: "Contracts" },
    { key: "routing" as const, label: "Routing" },
    { key: "shipments" as const, label: "Shipments" },
    { key: "suppliers" as const, label: "Suppliers" },
    { key: "tanks" as const, label: "Tanks" },
    { key: "buyers" as const, label: "Buyers" },
    { key: "warehouses" as const, label: "Warehouses" },
    { key: "terminals" as const, label: "Terminals" },
    { key: "storageTanks" as const, label: "Storage Tanks" },
    { key: "analytics" as const, label: "Analytics" },
    { key: "userManagement" as const, label: "User Management" },
  ];

  return (
    <div className="">
      {ConfirmDialogProps && <ConfirmDialog {...ConfirmDialogProps} />}
      <PageHeader
        title="User Management"
        description="Manage users and their permissions"
        actions={
          <div className="flex space-x-2">
            <Button
              variant="primary"
              onClick={() => setIsAddingUser(true)}
              disabled={loading}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
            <Button variant="secondary" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />
      <div className="p-6 mt-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Search
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search users by name or email"
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => setIsAddingUser(true)}
                className="md:hidden"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mt-4">
          <UserFormModal
            isOpen={isAddingUser}
            onClose={() => setIsAddingUser(false)}
            title="Add New User"
            email={newUserEmail}
            setEmail={setNewUserEmail}
            role={newUserRole}
            setRole={setNewUserRole}
            onSubmit={handleAddUserSubmit}
            isSubmitting={isSubmitting}
          />

          <UserManagementTable
            users={users}
            loading={loading}
            currentUser={currentUser}
            searchTerm={searchTerm}
            onEditUser={startEditingUser}
            onSavePermissions={saveUserPermissions}
            onCancelEdit={cancelEditingUser}
            editingUser={editingUser}
            editedPermissions={editedPermissions}
            updatePermission={updatePermission}
            permissionSections={permissionSections}
            onDeleteUser={handleDeleteUser}
            deletingUserId={deletingUserId}
          />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
