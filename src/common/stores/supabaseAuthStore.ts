import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../services/supabaseClient";
import {
  User,
  UserPermissions,
  adminPermissions,
  defaultPermissions,
} from "../types/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  addUser: (
    email: string,
    role: "admin" | "user",
    permissions?: UserPermissions,
  ) => Promise<void>;
  updateUserPermissions: (
    userId: string,
    permissions: UserPermissions,
  ) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const useSupabaseAuthStore = create<AuthState>(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isInitialized: false,
      isAuthenticated: false,

      login: async () => {
        set({ isLoading: true, error: null });
        try {
          // Default to admin email for backward compatibility
          await get().loginWithEmail("abdeltawab@tagaddod.com");
        } catch (error: any) {
          console.error("Login error:", error);
          set({
            isLoading: false,
            error: error.message || "Failed to login. Please try again.",
            isAuthenticated: false,
          });
        }
      },

      loginWithEmail: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          // Fetch the user from Supabase
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

          if (userError) {
            throw new Error(
              "User not found. Please check your email or contact support.",
            );
          }

          // Get user permissions
          const { data: permissionsData, error: permissionsError } =
            await supabase
              .from("user_permissions")
              .select("*")
              .eq("user_id", userData.id)
              .single();

          // Use default permissions based on role
          let userPermissions =
            userData.role === "admin" ? adminPermissions : defaultPermissions;

          if (!permissionsError && permissionsData) {
            userPermissions = {
              dashboard: permissionsData.dashboard,
              contracts: permissionsData.contracts,
              routing: permissionsData.routing,
              shipments: permissionsData.shipments,
              suppliers: permissionsData.suppliers,
              tanks: permissionsData.tanks,
              buyers: permissionsData.buyers,
              warehouses: permissionsData.warehouses,
              terminals: permissionsData.terminals,
              storageTanks: permissionsData.storage_tanks,
              analytics: permissionsData.analytics,
              userManagement: permissionsData.user_management,
            };
          }

          const user: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            photoURL: userData.photo_url || undefined,
            role: userData.role,
            permissions: userPermissions,
            createdAt: new Date(userData.created_at),
            updatedAt: new Date(userData.updated_at),
          };

          // Store in localStorage for persistence
          localStorage.setItem("demo-admin-user", JSON.stringify(user));

          set({
            user,
            isLoading: false,
            isAuthenticated: true,
            isInitialized: true,
          });
        } catch (error: any) {
          console.error("Login error:", error);
          set({
            isLoading: false,
            error: error.message || "Failed to login. Please try again.",
            isAuthenticated: false,
          });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // For demo, just remove from localStorage
          localStorage.removeItem("demo-admin-user");

          set({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });

          // Redirect to login page
          window.location.href = "/login";
        } catch (error: any) {
          console.error("Logout error:", error);
          set({
            isLoading: false,
            error: error.message || "Failed to logout. Please try again.",
          });
        }
      },

      getAllUsers: async () => {
        try {
          // Get all users from Supabase with a more efficient query
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("*")
            .order("name", { ascending: true });

          if (usersError) throw usersError;

          // Get all permissions in a single query
          const { data: allPermissionsData, error: permissionsError } =
            await supabase.from("user_permissions").select("*");

          if (permissionsError) {
            console.error("Error fetching all permissions:", permissionsError);
          }

          // Create a map of user_id to permissions for faster lookup
          const permissionsMap = {};
          if (allPermissionsData) {
            allPermissionsData.forEach((perm) => {
              permissionsMap[perm.user_id] = perm;
            });
          }

          const users: User[] = usersData.map((userData) => {
            const permissionsData = permissionsMap[userData.id];

            // Default permissions based on role
            const defaultPerms =
              userData.role === "admin"
                ? adminPermissions
                : {
                    dashboard: { view: true, edit: false, delete: false },
                    contracts: { view: false, edit: false, delete: false },
                    routing: { view: false, edit: false, delete: false },
                    shipments: { view: false, edit: false, delete: false },
                    suppliers: { view: false, edit: false, delete: false },
                    tanks: { view: false, edit: false, delete: false },
                    buyers: { view: false, edit: false, delete: false },
                    warehouses: { view: false, edit: false, delete: false },
                    terminals: { view: false, edit: false, delete: false },
                    storageTanks: { view: false, edit: false, delete: false },
                    analytics: { view: false, edit: false, delete: false },
                    userManagement: { view: false, edit: false, delete: false },
                  };

            // Use permissions from database or defaults
            let permissions = defaultPerms;
            if (permissionsData) {
              permissions = {
                dashboard: permissionsData.dashboard,
                contracts: permissionsData.contracts,
                routing: permissionsData.routing,
                shipments: permissionsData.shipments,
                suppliers: permissionsData.suppliers,
                tanks: permissionsData.tanks,
                buyers: permissionsData.buyers,
                warehouses: permissionsData.warehouses,
                terminals: permissionsData.terminals,
                storageTanks: permissionsData.storage_tanks,
                analytics: permissionsData.analytics,
                userManagement: permissionsData.user_management,
              };
            }

            return {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              photoURL: userData.photo_url || undefined,
              role: userData.role,
              permissions: permissions,
              createdAt: new Date(userData.created_at),
              updatedAt: new Date(userData.updated_at),
            };
          });

          return users;
        } catch (error) {
          console.error("Error getting all users:", error);
          // Still return the demo user if available
          const demoUser = localStorage.getItem("demo-admin-user");
          return demoUser ? [JSON.parse(demoUser)] : [];
        }
      },

      addUser: async (
        email: string,
        role: "admin" | "user",
        customPermissions?: UserPermissions,
      ) => {
        if (!email.endsWith("@tagaddod.com")) {
          throw new Error("Only Tagaddod email addresses are allowed");
        }

        try {
          console.log("Starting user creation process for:", email);

          // Check if user already exists
          const { data: existingUsers, error: checkError } = await supabase
            .from("users")
            .select("id")
            .eq("email", email);

          if (checkError) {
            console.error("Error checking existing user:", checkError);
            throw checkError;
          }

          if (existingUsers && existingUsers.length > 0) {
            throw new Error("User already exists");
          }

          console.log("Creating new user with role:", role);

          // Create new user
          const { data: userData, error: userError } = await supabase
            .from("users")
            .insert({
              email,
              name: email.split("@")[0],
              role,
            })
            .select()
            .single();

          if (userError) {
            console.error("Error creating user:", userError);
            throw userError;
          }

          console.log("User created successfully:", userData);

          // Set permissions based on role or use custom permissions if provided
          const permissions =
            customPermissions ||
            (role === "admin" ? adminPermissions : defaultPermissions);

          // Convert permissions to Supabase format
          const supabasePermissions = {
            user_id: userData.id,
            dashboard: permissions.dashboard,
            contracts: permissions.contracts,
            routing: permissions.routing,
            shipments: permissions.shipments,
            suppliers: permissions.suppliers,
            tanks: permissions.tanks,
            buyers: permissions.buyers,
            warehouses: permissions.warehouses,
            terminals: permissions.terminals,
            storage_tanks: permissions.storageTanks,
            analytics: permissions.analytics,
            user_management: permissions.userManagement,
          };

          console.log("Inserting permissions for user:", userData.id);

          // Use RPC function to bypass RLS
          const { error: permissionsError } = await supabase.rpc(
            "insert_user_permissions",
            { permissions_data: supabasePermissions },
          );

          // Fallback to direct insert if RPC fails
          if (permissionsError) {
            console.warn("RPC failed, trying direct insert:", permissionsError);

            // Try direct insert with service role
            const { error: directInsertError } = await supabase
              .from("user_permissions")
              .insert(supabasePermissions);

            if (directInsertError) {
              console.error(
                "Error setting user permissions:",
                directInsertError,
              );

              // If permissions insertion fails, delete the user to maintain consistency
              const { error: deleteError } = await supabase
                .from("users")
                .delete()
                .eq("id", userData.id);

              if (deleteError) {
                console.error(
                  "Error cleaning up user after permissions failure:",
                  deleteError,
                );
              }

              throw new Error(
                `Failed to set user permissions: ${directInsertError.message}`,
              );
            }
          }

          console.log("User and permissions created successfully");
        } catch (error: any) {
          console.error("Error in addUser function:", error);
          throw error;
        }
      },

      deleteUser: async (userId: string) => {
        try {
          // Check if trying to delete the super admin
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("email")
            .eq("id", userId)
            .single();

          if (userError) throw userError;

          if (userData.email === "abdeltawab@tagaddod.com") {
            throw new Error("Cannot delete the super admin user");
          }

          // Delete user permissions first (cascade will handle this, but being explicit)
          const { error: permissionsError } = await supabase
            .from("user_permissions")
            .delete()
            .eq("user_id", userId);

          if (permissionsError) throw permissionsError;

          // Delete the user
          const { error: deleteError } = await supabase
            .from("users")
            .delete()
            .eq("id", userId);

          if (deleteError) throw deleteError;
        } catch (error: any) {
          console.error("Error deleting user:", error);
          throw error;
        }
      },

      updateUserPermissions: async (
        userId: string,
        permissions: UserPermissions,
      ) => {
        try {
          // For demo, update in localStorage if it's our admin user
          const demoUser = localStorage.getItem("demo-admin-user");
          if (demoUser) {
            const user = JSON.parse(demoUser);
            if (user.id === userId) {
              user.permissions = permissions;
              user.updatedAt = new Date();
              localStorage.setItem("demo-admin-user", JSON.stringify(user));

              // Update current user if it's the same user
              if (get().user?.id === userId) {
                set((state) => ({
                  user: state.user ? { ...state.user, permissions } : null,
                }));
              }
              return;
            }
          }

          // Otherwise use Supabase
          // Convert permissions to Supabase format
          const supabasePermissions = {
            dashboard: permissions.dashboard,
            contracts: permissions.contracts,
            routing: permissions.routing,
            shipments: permissions.shipments,
            suppliers: permissions.suppliers,
            tanks: permissions.tanks,
            buyers: permissions.buyers,
            warehouses: permissions.warehouses,
            terminals: permissions.terminals,
            storage_tanks: permissions.storageTanks,
            analytics: permissions.analytics,
            user_management: permissions.userManagement,
            updated_at: new Date().toISOString(),
          };

          // Check if permissions record exists
          const { data: existingPermissions, error: checkError } =
            await supabase
              .from("user_permissions")
              .select("id")
              .eq("user_id", userId);

          if (checkError) throw checkError;

          // Try using RPC function first to bypass RLS
          if (existingPermissions && existingPermissions.length > 0) {
            // Update existing permissions using RPC
            const { error: rpcError } = await supabase.rpc(
              "update_user_permissions",
              {
                user_id: userId,
                permissions_data: supabasePermissions,
              },
            );

            if (rpcError) {
              console.warn(
                "RPC update failed, trying direct update:",
                rpcError,
              );

              // Fallback to direct update
              const { error: updateError } = await supabase
                .from("user_permissions")
                .update(supabasePermissions)
                .eq("user_id", userId);

              if (updateError) throw updateError;
            }
          } else {
            // Create new permissions record using RPC
            const { error: rpcError } = await supabase.rpc(
              "insert_user_permissions",
              {
                permissions_data: {
                  user_id: userId,
                  ...supabasePermissions,
                },
              },
            );

            if (rpcError) {
              console.warn(
                "RPC insert failed, trying direct insert:",
                rpcError,
              );

              // Fallback to direct insert
              const { error: insertError } = await supabase
                .from("user_permissions")
                .insert({
                  user_id: userId,
                  ...supabasePermissions,
                });

              if (insertError) throw insertError;
            }
          }

          // Update current user if it's the same user
          if (get().user?.id === userId) {
            set((state) => ({
              user: state.user ? { ...state.user, permissions } : null,
            }));
          }
        } catch (error: any) {
          console.error("Error updating user permissions:", error);
          throw new Error(error.message || "Failed to update user permissions");
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Initialize auth state by checking for existing session
const initializeAuth = async () => {
  const authStore = useSupabaseAuthStore.getState();

  try {
    // Check if there's a stored user in localStorage
    const storedUser = localStorage.getItem("demo-admin-user");

    if (storedUser) {
      // Parse the stored user
      const userData = JSON.parse(storedUser);

      // Set user data
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL,
        role: userData.role,
        permissions: userData.permissions,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt),
      };

      useSupabaseAuthStore.setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } else {
      useSupabaseAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  } catch (error: any) {
    console.error("Error initializing auth:", error);
    useSupabaseAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: error.message || "Failed to initialize authentication",
    });
  }
};

// Initialize auth on app load
initializeAuth();

// Track user activity
let lastActivityTime = new Date();
const activityEvents = [
  "mousedown",
  "keydown",
  "mousemove",
  "touchstart",
  "scroll",
];

// Update last activity time when user interacts with the page
activityEvents.forEach((eventType) => {
  window.addEventListener(
    eventType,
    () => {
      lastActivityTime = new Date();

      // Also update the stored user's updatedAt time to prevent expiration while active
      const storedUser = localStorage.getItem("demo-admin-user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.lastActivity = lastActivityTime.toISOString();
        localStorage.setItem("demo-admin-user", JSON.stringify(userData));
      }
    },
    true,
  );
});

// Set up session expiration check - 10 minutes (600000 ms) of inactivity
setInterval(() => {
  const storedUser = localStorage.getItem("demo-admin-user");
  if (storedUser) {
    const userData = JSON.parse(storedUser);
    const now = new Date();
    const lastActivity = userData.lastActivity
      ? new Date(userData.lastActivity)
      : new Date(userData.updatedAt);

    // If more than 10 minutes have passed since last activity, log out
    if (now.getTime() - lastActivity.getTime() > 600000) {
      console.log("Session expired after 10 minutes of inactivity");
      localStorage.removeItem("demo-admin-user");
      useSupabaseAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error:
          "Your session has expired due to inactivity. Please log in again.",
      });

      // Redirect to login page
      window.location.href = "/login";
    }
  }
}, 60000); // Check every minute

export default useSupabaseAuthStore;
