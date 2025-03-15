import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  User,
  UserPermissions,
  defaultPermissions,
  adminPermissions,
} from "../types/auth";
import { auth, db } from "../config/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkUserAccess: () => Promise<boolean>;
  getUserPermissions: (email: string) => Promise<UserPermissions>;
  updateUserPermissions: (
    userId: string,
    permissions: UserPermissions,
  ) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  addUser: (
    email: string,
    role: "admin" | "user",
    permissions?: UserPermissions,
  ) => Promise<void>;
}

const useAuthStore = create<AuthState>(
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
          // For demo purposes, we'll automatically log in with a predefined admin account
          // In a real app, this would use the Google authentication flow

          // Check if the email is abdeltawab@tagaddod.com and make them admin
          const email = "abdeltawab@tagaddod.com";

          // Create a mock user object
          const mockUser = {
            uid: "admin-user-123",
            email: email,
            displayName: "Abdeltawab",
            photoURL: null,
          };

          // Set admin permissions
          const permissions = adminPermissions;

          const userData: User = {
            id: mockUser.uid,
            email: mockUser.email,
            name: mockUser.displayName || mockUser.email,
            photoURL: mockUser.photoURL || undefined,
            role: "admin",
            permissions,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Store in localStorage for persistence
          localStorage.setItem("demo-admin-user", JSON.stringify(userData));

          set({
            user: userData,
            isLoading: false,
            isAuthenticated: true,
            isInitialized: true,
          });
        } catch (error) {
          console.error("Login error:", error);
          set({
            isLoading: false,
            error: "Failed to login. Please try again.",
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
        } catch (error) {
          console.error("Logout error:", error);
          set({
            isLoading: false,
            error: "Failed to logout. Please try again.",
          });
        }
      },

      checkUserAccess: async () => {
        if (!auth.currentUser?.email) return false;

        try {
          // Check if user exists in the users collection
          const usersRef = collection(db, "users");
          const q = query(
            usersRef,
            where("email", "==", auth.currentUser.email),
          );
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            // Check if this is the first user (make them admin)
            const allUsers = await getDocs(collection(db, "users"));
            if (allUsers.empty) {
              // First user - create as admin
              await setDoc(doc(db, "users", auth.currentUser.uid), {
                email: auth.currentUser.email,
                name: auth.currentUser.displayName || auth.currentUser.email,
                photoURL: auth.currentUser.photoURL || "",
                role: "admin",
                permissions: adminPermissions,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              });
              return true;
            }
            return false;
          }

          return true;
        } catch (error) {
          console.error("Error checking user access:", error);
          return false;
        }
      },

      getUserPermissions: async (email: string) => {
        try {
          // For demo, if it's our admin email, return admin permissions
          if (email === "abdeltawab@tagaddod.com") {
            return adminPermissions;
          }

          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", email));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            return defaultPermissions;
          }

          const userData = querySnapshot.docs[0].data();
          return userData.permissions as UserPermissions;
        } catch (error) {
          console.error("Error getting user permissions:", error);
          return defaultPermissions;
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

          // Otherwise use Firestore
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, {
            permissions,
            updatedAt: Timestamp.now(),
          });

          // Update current user if it's the same user
          if (get().user?.id === userId) {
            set((state) => ({
              user: state.user ? { ...state.user, permissions } : null,
            }));
          }
        } catch (error) {
          console.error("Error updating user permissions:", error);
          throw new Error("Failed to update user permissions");
        }
      },

      getAllUsers: async () => {
        try {
          // For demo, include our admin user from localStorage
          const users: User[] = [];
          const demoUser = localStorage.getItem("demo-admin-user");
          if (demoUser) {
            users.push(JSON.parse(demoUser));
          }

          // Also get users from Firestore
          const usersRef = collection(db, "users");
          const querySnapshot = await getDocs(usersRef);

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Don't add duplicate of our admin user
            if (data.email !== "abdeltawab@tagaddod.com") {
              users.push({
                id: doc.id,
                email: data.email,
                name: data.name,
                photoURL: data.photoURL,
                role: data.role,
                permissions: data.permissions,
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
              });
            }
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
        permissions?: UserPermissions,
      ) => {
        if (!email.endsWith("@tagaddod.com")) {
          throw new Error("Only Tagaddod email addresses are allowed");
        }

        try {
          // Check if user already exists
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            throw new Error("User already exists");
          }

          // Create new user document with a temporary ID
          const newUserRef = doc(collection(db, "users"));
          await setDoc(newUserRef, {
            email,
            name: email.split("@")[0],
            photoURL: "",
            role,
            permissions:
              permissions ||
              (role === "admin" ? adminPermissions : defaultPermissions),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        } catch (error) {
          console.error("Error adding user:", error);
          throw error;
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

export default useAuthStore;
