import React from "react";
import PageHeader from "../../common/components/PageHeader/PageHeader";
import { UserPlus } from "lucide-react";
import Button from "../../common/components/Button/Button";
import TableToolbar from "../../common/components/Table/TableToolbar";
import UserManagementTable from "./UserManagementTable";
import UserAddForm from "./UserAddForm";
import useUserManagement from "../../common/hooks/useUserManagement";

const UserManagement: React.FC = () => {
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
  } = useUserManagement();

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
      <PageHeader
        title="User Management"
        description="Manage users and their permissions"
        actions={
          <Button
            variant="primary"
            onClick={() => setIsAddingUser(true)}
            disabled={isAddingUser || loading}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        }
      />

      <div className="p-6 mt-6">
        <TableToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onEditColumns={() => {}}
          onOpenFilters={() => {}}
          searchPlaceholder="Search users by name or email"
        />

        <div className="bg-white rounded-lg shadow mt-4">
          {isAddingUser && (
            <UserAddForm
              newUserEmail={newUserEmail}
              setNewUserEmail={setNewUserEmail}
              newUserRole={newUserRole}
              setNewUserRole={setNewUserRole}
              handleAddUser={handleAddUser}
              onCancel={() => setIsAddingUser(false)}
            />
          )}

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
          />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
