import React from 'react';
import { Ship } from 'lucide-react';

export default function ShipmentFormSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="h-6 w-32 bg-gray-200 rounded" />
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="h-6 w-24 bg-gray-200 rounded" />
        </div>
        <div className="p-6">
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="h-6 w-28 bg-gray-200 rounded" />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}