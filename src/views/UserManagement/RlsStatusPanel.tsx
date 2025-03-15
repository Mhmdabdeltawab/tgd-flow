import React from "react";
import { useRlsStatus } from "../../common/hooks/useRlsStatus";
import { Shield, ShieldAlert, ShieldCheck, Info } from "lucide-react";

const RlsStatusPanel: React.FC = () => {
  const { isEnabled, tables, loading, error } = useRlsStatus();

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-gray-400" />
          <span className="text-gray-600">Loading security status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg shadow-sm border border-red-200">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          <span className="text-red-700">Error checking security status</span>
        </div>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const usersTable = tables.find((t) => t.name === "users");
  const userPermissionsTable = tables.find(
    (t) => t.name === "user_permissions",
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center space-x-2 mb-3">
        {isEnabled ? (
          <ShieldCheck className="h-5 w-5 text-green-500" />
        ) : (
          <ShieldAlert className="h-5 w-5 text-red-500" />
        )}
        <h3 className="font-medium">
          Row Level Security:{" "}
          {isEnabled ? (
            <span className="text-green-600">Enabled</span>
          ) : (
            <span className="text-red-600">Disabled</span>
          )}
        </h3>
      </div>

      <div className="space-y-3 mt-3">
        <div className="border-t border-gray-100 pt-2">
          <h4 className="text-sm font-medium mb-1">Users Table</h4>
          {usersTable ? (
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-sm">
                  RLS:{" "}
                  {usersTable.hasRls ? (
                    <span className="text-green-600">Enabled</span>
                  ) : (
                    <span className="text-red-600">Disabled</span>
                  )}
                </span>
              </div>
              {usersTable.policies.length > 0 ? (
                <div className="mt-1">
                  <p className="text-xs text-gray-500 mb-1">Policies:</p>
                  <ul className="text-xs text-gray-600 list-disc pl-5">
                    {usersTable.policies.map((policy, index) => (
                      <li key={index}>{policy}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  No policies defined
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500">Table not found</p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-2">
          <h4 className="text-sm font-medium mb-1">User Permissions Table</h4>
          {userPermissionsTable ? (
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-sm">
                  RLS:{" "}
                  {userPermissionsTable.hasRls ? (
                    <span className="text-green-600">Enabled</span>
                  ) : (
                    <span className="text-red-600">Disabled</span>
                  )}
                </span>
              </div>
              {userPermissionsTable.policies.length > 0 ? (
                <div className="mt-1">
                  <p className="text-xs text-gray-500 mb-1">Policies:</p>
                  <ul className="text-xs text-gray-600 list-disc pl-5">
                    {userPermissionsTable.policies.map((policy, index) => (
                      <li key={index}>{policy}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  No policies defined
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500">Table not found</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-start space-x-2 bg-blue-50 p-2 rounded-md">
        <Info className="h-4 w-4 text-blue-500 mt-0.5" />
        <p className="text-xs text-blue-700">
          Row Level Security (RLS) restricts which rows can be accessed by
          normal users. Admin users have full access to all data based on the
          policies.
        </p>
      </div>
    </div>
  );
};

export default RlsStatusPanel;
