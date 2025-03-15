export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  role: UserRole;
  permissions: UserPermissions;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "admin" | "user";

export interface Permission {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export interface UserPermissions {
  dashboard: Permission;
  contracts: Permission;
  routing: Permission;
  shipments: Permission;
  suppliers: Permission;
  tanks: Permission;
  buyers: Permission;
  warehouses: Permission;
  terminals: Permission;
  storageTanks: Permission;
  analytics: Permission;
  userManagement: Permission;
}

export const defaultPermissions: UserPermissions = {
  dashboard: { view: true, edit: false, delete: false },
  contracts: { view: true, edit: true, delete: true },
  routing: { view: true, edit: true, delete: true },
  shipments: { view: true, edit: true, delete: true },
  suppliers: { view: true, edit: true, delete: true },
  tanks: { view: true, edit: true, delete: true },
  buyers: { view: true, edit: true, delete: true },
  warehouses: { view: true, edit: true, delete: true },
  terminals: { view: true, edit: true, delete: true },
  storageTanks: { view: true, edit: true, delete: true },
  analytics: { view: true, edit: false, delete: false },
  userManagement: { view: false, edit: false, delete: false },
};

export const adminPermissions: UserPermissions = {
  dashboard: { view: true, edit: false, delete: false },
  contracts: { view: true, edit: true, delete: true },
  routing: { view: true, edit: true, delete: true },
  shipments: { view: true, edit: true, delete: true },
  suppliers: { view: true, edit: true, delete: true },
  tanks: { view: true, edit: true, delete: true },
  buyers: { view: true, edit: true, delete: true },
  warehouses: { view: true, edit: true, delete: true },
  terminals: { view: true, edit: true, delete: true },
  storageTanks: { view: true, edit: true, delete: true },
  analytics: { view: true, edit: false, delete: false },
  userManagement: { view: true, edit: true, delete: true },
};
