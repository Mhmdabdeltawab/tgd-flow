import React, { useState, useCallback, useMemo } from "react";
import { User, UserPermissions } from "../../common/types/auth";
import { Edit, Save, X, RefreshCw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../common/components/Button/Button";
import { useDebounce } from "../../common/hooks/useDebounce";
import DeleteButton from "../../common/components/DeleteButton/DeleteButton";
import useSupabaseAuthStore from "../../common/stores/supabaseAuthStore";
import usePermissions from "../../common/hooks/usePermissions";
import PermissionGuard from "../../common/components/Auth/PermissionGuard";

interface UserManagementTableProps {
  users: User[];
  loading: boolean;
  currentUser: User | null;
  searchTerm: string;
  onEditUser: (userId: string, permissions: UserPermissions) => void;
  onSavePermissions: (userId: string) => Promise<void>;
  onCancelEdit: () => void;
  onDeleteUser?: (userId: string) => Promise<void>;
  editingUser: string | null;
  editedPermissions: UserPermissions | null;
  updatePermission: (
    section: keyof UserPermissions,
    type: "view" | "edit" | "delete",
    value: boolean,
  ) => void;
  permissionSections: Array<{ key: keyof UserPermissions; label: string }>;
  deletingUserId?: string | null;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  loading,
  currentUser,
  searchTerm,
  onEditUser,
  onSavePermissions,
  onCancelEdit,
  onDeleteUser,
  editingUser,
  editedPermissions,
  updatePermission,
  permissionSections,
  deletingUserId,
}) => {
  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const { canEdit, canDelete } = usePermissions();

  const filteredUsers = useMemo(() => {
    if (!debouncedSearchTerm) return users;
    if (!Array.isArray(users)) {
      console.warn("Users is not an array:", users);
      return [];
    }

    const lowerCaseSearch = debouncedSearchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(lowerCaseSearch) ||
        user.email?.toLowerCase().includes(lowerCaseSearch) ||
        user.role?.toLowerCase().includes(lowerCaseSearch),
    );
  }, [users, debouncedSearchTerm]);

  const handleSavePermissions = async (userId: string) => {
    setSavingUserId(userId);
    try {
      await onSavePermissions(userId);
    } catch (error) {
      console.error("Error saving permissions:", error);
      // Error will be shown by the toast in the parent component
    } finally {
      setSavingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!onDeleteUser) return;
    await onDeleteUser(userId);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (!Array.isArray(users)) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Error loading users. Data format is incorrect.</p>
        <Button
          variant="secondary"
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Page
        </Button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No users found. Add a user to get started.
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No users match your search criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Permissions
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {user.photoURL ? (
                    <img
                      className="h-8 w-8 rounded-full mr-3"
                      src={user.photoURL}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <span className="text-indigo-600 font-medium">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.email || "No email"}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}`}
                >
                  {user.role === "admin" ? "Admin" : "User"}
                </span>
              </td>
              <td className="px-6 py-4">
                {editingUser === user.id && editedPermissions ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissionSections.map((section) => (
                      <div key={section.key} className="bg-gray-50 p-3 rounded">
                        <div className="font-medium text-sm mb-2">
                          {section.label}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`${user.id}-${section.key}-view`}
                              checked={
                                editedPermissions[section.key]?.view || false
                              }
                              onChange={(e) =>
                                updatePermission(
                                  section.key,
                                  "view",
                                  e.target.checked,
                                )
                              }
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`${user.id}-${section.key}-view`}
                              className="ml-2 text-sm text-gray-700"
                            >
                              View
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`${user.id}-${section.key}-edit`}
                              checked={
                                editedPermissions[section.key]?.edit || false
                              }
                              onChange={(e) =>
                                updatePermission(
                                  section.key,
                                  "edit",
                                  e.target.checked,
                                )
                              }
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`${user.id}-${section.key}-edit`}
                              className="ml-2 text-sm text-gray-700"
                            >
                              Edit
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`${user.id}-${section.key}-delete`}
                              checked={
                                editedPermissions[section.key]?.delete || false
                              }
                              onChange={(e) =>
                                updatePermission(
                                  section.key,
                                  "delete",
                                  e.target.checked,
                                )
                              }
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`${user.id}-${section.key}-delete`}
                              className="ml-2 text-sm text-gray-700"
                            >
                              Delete
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {user.permissions &&
                      Object.entries(user.permissions)
                        .filter(
                          ([_, permission]) =>
                            permission?.view ||
                            permission?.edit ||
                            permission?.delete,
                        )
                        .map(([key, permission]) => {
                          const section = permissionSections.find(
                            (s) => s.key === key,
                          );
                          if (!section) return null;

                          const permissions = [];
                          if (permission?.view) permissions.push("View");
                          if (permission?.edit) permissions.push("Edit");
                          if (permission?.delete) permissions.push("Delete");

                          return (
                            <div key={key} className="mb-1">
                              <span className="font-medium">
                                {section.label}:
                              </span>{" "}
                              {permissions.join(", ")}
                            </div>
                          );
                        })}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {editingUser === user.id ? (
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="primary"
                      onClick={() => handleSavePermissions(user.id)}
                      className="inline-flex items-center px-2.5 py-1.5 text-xs"
                      disabled={savingUserId === user.id}
                    >
                      {savingUserId === user.id ? (
                        <>
                          <div className="w-3 h-3 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={onCancelEdit}
                      className="inline-flex items-center px-2.5 py-1.5 text-xs"
                      disabled={savingUserId === user.id}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <PermissionGuard
                      resource="userManagement"
                      permission="edit"
                    >
                      <Button
                        variant="secondary"
                        onClick={() =>
                          onEditUser(user.id, user.permissions || {})
                        }
                        className="inline-flex items-center px-2.5 py-1.5 text-xs"
                        disabled={
                          (currentUser?.id === user.id &&
                            currentUser?.role === "admin") ||
                          savingUserId === user.id ||
                          deletingUserId === user.id
                        }
                      >
                        {savingUserId === user.id ? (
                          <>
                            <div className="w-3 h-3 mr-1 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            <Edit className="w-3 h-3 mr-1" />
                            Quick Edit
                          </>
                        )}
                      </Button>
                    </PermissionGuard>
                    {onDeleteUser && (
                      <PermissionGuard
                        resource="userManagement"
                        permission="delete"
                      >
                        <DeleteButton
                          id={user.id}
                          resourceType="User"
                          onDelete={handleDeleteUser}
                          disabled={
                            currentUser?.id === user.id ||
                            savingUserId === user.id ||
                            deletingUserId === user.id
                          }
                          size="sm"
                          checkPermission={true}
                        />
                      </PermissionGuard>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementTable;
