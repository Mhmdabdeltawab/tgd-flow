import React, { useState } from "react";
import Button from "../../common/components/Button/Button";
import FormField from "../../common/components/Form/FormField";
import { X } from "lucide-react";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  email: string;
  setEmail: (email: string) => void;
  role: "admin" | "user";
  setRole: (role: "admin" | "user") => void;
  onSubmit: () => Promise<void>;
  isSubmitting?: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  title,
  email,
  setEmail,
  role,
  setRole,
  onSubmit,
  isSubmitting = false,
}) => {
  const [emailError, setEmailError] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!email.endsWith("@tagaddod.com")) {
      setEmailError("Only Tagaddod email addresses are allowed");
      return;
    }

    setEmailError("");
    await onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <FormField label="Email" error={emailError} required>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              placeholder="user@tagaddod.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isSubmitting}
              required
            />
          </FormField>

          <FormField label="Role" required>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "user")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isSubmitting}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </FormField>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              type="button"
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
