import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useSupabaseAuthStore from "../../common/stores/supabaseAuthStore";
import { useToast } from "../../common/hooks/useToast";
import { User, UserPermissions } from "../../common/types/auth";
import LoadingScreen from "../../common/components/Auth/LoadingScreen";
import PageHeader from "../../common/components/PageHeader/PageHeader";
import Button from "../../common/components/Button/Button";

const EditUserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAllUsers, updateUserPermissions } = useSupabaseAuthStore();
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const users = await getAllUsers();
        const foundUser = users.find((u) => u.id === id);

        if (!foundUser) {
          toast.error("User not found");
          navigate("/user-management");
          return;
        }

        setUser(foundUser);
        setPermissions(foundUser.permissions);
      } catch (error: any) {
        toast.error(error.message || "Failed to load user");
        navigate("/user-management");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id, getAllUsers, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !permissions || !id) return;

    setIsSubmitting(true);

    try {
      await updateUserPermissions(id, permissions);
      toast.success("User permissions updated successfully");
      navigate("/user-management");
    } catch (error: any) {
      toast.error(error.message || "Failed to update user permissions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermissionChange = (
    resource: keyof UserPermissions,
    action: "view" | "edit" | "delete",
    value: boolean,
  ) => {
    if (!permissions) return;

    setPermissions((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [resource]: {
          ...prev[resource],
          [action]: value,
        },
      };
    });
  };

  if (isLoading) {
    return <LoadingScreen message="Loading user data..." />;
  }

  if (!user || !permissions) {
    return <div className="p-6 text-center text-red-500">User not found</div>;
  }

  const isAdminUser = user.email === "abdeltawab@tagaddod.com";

  return (
    <div className="p-6">
      <PageHeader
        title={`Edit User: ${user.name}`}
        description="Modify user permissions"
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
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 h-12 w-12">
              {user.photoURL ? (
                <img
                  className="h-12 w-12 rounded-full"
                  src={user.photoURL}
                  alt={user.name}
                  loading="lazy"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mt-1 ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Permissions</h2>

            {isAdminUser && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-700">
                  This is the super admin user. Some permissions cannot be
                  modified.
                </p>
              </div>
            )}

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
                        disabled={isAdminUser}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
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
                        disabled={isAdminUser}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                      />
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400">-</td>
                    <td className="py-3 px-4 text-center text-gray-400">-</td>
                  </tr>

                  {/* User Management - Special case for admin user */}
                  <tr className="border-t border-gray-200">
                    <td className="py-3 px-4 font-medium">User Management</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={permissions.userManagement.view}
                        onChange={(e) =>
                          handlePermissionChange(
                            "userManagement",
                            "view",
                            e.target.checked,
                          )
                        }
                        disabled={isAdminUser}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={permissions.userManagement.edit}
                        onChange={(e) =>
                          handlePermissionChange(
                            "userManagement",
                            "edit",
                            e.target.checked,
                          )
                        }
                        disabled={isAdminUser}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={permissions.userManagement.delete}
                        onChange={(e) =>
                          handlePermissionChange(
                            "userManagement",
                            "delete",
                            e.target.checked,
                          )
                        }
                        disabled={isAdminUser}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                      />
                    </td>
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
                          disabled={isAdminUser}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
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
                          disabled={isAdminUser}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
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
                          disabled={isAdminUser}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
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
              disabled={isSubmitting || isAdminUser}
              className={isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserForm;
