import React from "react";
import Button from "../../common/components/Button/Button";

interface UserAddFormProps {
  newUserEmail: string;
  setNewUserEmail: (email: string) => void;
  newUserRole: "admin" | "user";
  setNewUserRole: (role: "admin" | "user") => void;
  handleAddUser: () => Promise<void>;
  onCancel: () => void;
}

const UserAddForm: React.FC<UserAddFormProps> = ({
  newUserEmail,
  setNewUserEmail,
  newUserRole,
  setNewUserRole,
  handleAddUser,
  onCancel,
}) => {
  return (
    <div className="p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            placeholder="user@tagaddod.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value as "admin" | "user")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex items-end space-x-2">
          <Button variant="primary" onClick={handleAddUser}>
            Add
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserAddForm;
