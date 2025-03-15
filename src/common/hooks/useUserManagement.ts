import { useState, useCallback, useEffect } from "react";
import useSupabaseAuthStore from "../stores/supabaseAuthStore";
import { User, UserPermissions, Permission } from "../types/auth";
import { useToast } from "./useToast";

const useUserManagement = () => {
  const {
    getAllUsers,
    addUser,
    updateUserPermissions,
    user: currentUser,
  } = useSupabaseAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editedPermissions, setEditedPermissions] =
    useState<UserPermissions | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Add a small delay to prevent UI freezing
      setTimeout(async () => {
        try {
          const allUsers = await getAllUsers();
          setUsers(allUsers);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching users:", error);
          showToast({
            type: "error",
            title: "Error",
            message: "Failed to load users. Please try again.",
          });
          setLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      setLoading(false);
    }
  }, [getAllUsers, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      showToast({
        type: "error",
        title: "Error",
        message: "Please enter an email address",
      });
      return;
    }

    if (!newUserEmail.endsWith("@tagaddod.com")) {
      showToast({
        type: "error",
        title: "Error",
        message: "Only Tagaddod email addresses are allowed",
      });
      return;
    }

    try {
      await addUser(newUserEmail, newUserRole);
      showToast({
        type: "success",
        title: "Success",
        message: "User added successfully",
      });
      setNewUserEmail("");
      setNewUserRole("user");
      setIsAddingUser(false);
      fetchUsers();
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to add user",
      });
    }
  };

  const startEditingUser = (userId: string, permissions: UserPermissions) => {
    setEditingUser(userId);
    setEditedPermissions(JSON.parse(JSON.stringify(permissions)));
  };

  const cancelEditingUser = () => {
    setEditingUser(null);
    setEditedPermissions(null);
  };

  const saveUserPermissions = async (userId: string) => {
    if (!editedPermissions) return;

    try {
      await updateUserPermissions(userId, editedPermissions);
      showToast({
        type: "success",
        title: "Success",
        message: "User permissions updated successfully",
      });
      setEditingUser(null);
      setEditedPermissions(null);
      fetchUsers();
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to update user permissions",
      });
    }
  };

  const updatePermission = (
    section: keyof UserPermissions,
    type: keyof Permission,
    value: boolean,
  ) => {
    if (!editedPermissions) return;

    setEditedPermissions({
      ...editedPermissions,
      [section]: {
        ...editedPermissions[section],
        [type]: value,
      },
    });
  };

  return {
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
  };
};

export default useUserManagement;
