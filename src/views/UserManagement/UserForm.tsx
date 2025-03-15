import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSupabaseAuthStore from "../../common/stores/supabaseAuthStore";
import { useToast } from "../../common/hooks/useToast";
import { UserPermissions, defaultPermissions } from "../../common/types/auth";
import PageHeader from "../../common/components/PageHeader/PageHeader";
import Button from "../../common/components/Button/Button";

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const { addUser } = useSupabaseAuthStore();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] =
    useState<UserPermissions>(defaultPermissions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!email.endsWith("@tagaddod.com")) {
      toast.error("Only @tagaddod.com email addresses are allowed");
      return;
    }

    setIsSubmitting(true);

    try {
      await addUser(email, role, permissions);
      toast.success("User added successfully");
      navigate("/user-management");
    } catch (error: any) {
      toast.error(error.message || "Failed to add user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermissionChange = (
    resource: keyof UserPermissions,
    action: "view" | "edit" | "delete",
    value: boolean,
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: value,
      },
    }));
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Add New User"
        description="Create a new user account with custom permissions"
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate("/user-management")}
          >
            Back to Users
          </Button>
        }
      />

      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 mt-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="user@tagaddod.com"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Only @tagaddod.com email addresses are allowed
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "user")}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Permissions</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left font-medium text-gray-600 w-1/4">
                      Resource
                    </th>
                    <th className="py-3 px-4 text-center font-medium text-gray-600 w-1/4">
                      View
                    </th>
                    <th className="py-3 px-4 text-center font-medium text-gray-600 w-1/4">
                      Edit
                    </th>
                    <th className="py-3 px-4 text-center font-medium text-gray-600 w-1/4">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Dashboard - View only */}
                  <tr className="border-t border-gray-200">
                    <td className="py-3 px-4 font-medium">Dashboard</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={permissions.dashboard.view}
                        onChange={(e) =>
                          handlePermissionChange(
                            "dashboard",
                            "view",
                            e.target.checked,
                          )
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400">-</td>
                    <td className="py-3 px-4 text-center text-gray-400">-</td>
                  </tr>

                  {/* Analytics - View only */}
                  <tr className="border-t border-gray-200">
                    <td className="py-3 px-4 font-medium">Analytics</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={permissions.analytics.view}
                        onChange={(e) =>
                          handlePermissionChange(
                            "analytics",
                            "view",
                            e.target.checked,
                          )
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400">-</td>
                    <td className="py-3 px-4 text-center text-gray-400">-</td>
                  </tr>

                  {/* Other resources with full permissions */}
                  {[
                    { key: "contracts", label: "Contracts" },
                    { key: "routing", label: "Routing" },
                    { key: "shipments", label: "Shipments" },
                    { key: "suppliers", label: "Suppliers" },
                    { key: "tanks", label: "Tanks" },
                    { key: "buyers", label: "Buyers" },
                    { key: "warehouses", label: "Warehouses" },
                    { key: "terminals", label: "Terminals" },
                    { key: "storageTanks", label: "Storage Tanks" },
                    { key: "userManagement", label: "User Management" },
                  ].map(({ key, label }) => (
                    <tr key={key} className="border-t border-gray-200">
                      <td className="py-3 px-4 font-medium">{label}</td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={
                            permissions[key as keyof UserPermissions].view
                          }
                          onChange={(e) =>
                            handlePermissionChange(
                              key as keyof UserPermissions,
                              "view",
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={
                            permissions[key as keyof UserPermissions].edit
                          }
                          onChange={(e) =>
                            handlePermissionChange(
                              key as keyof UserPermissions,
                              "edit",
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={
                            permissions[key as keyof UserPermissions].delete
                          }
                          onChange={(e) =>
                            handlePermissionChange(
                              key as keyof UserPermissions,
                              "delete",
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              onClick={() => navigate("/user-management")}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              className={isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
            >
              {isSubmitting ? "Adding..." : "Add User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
