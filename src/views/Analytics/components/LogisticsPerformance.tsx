import React from 'react';
import { Ship, Container, Warehouse, Building } from 'lucide-react';
import StatusBadge from '../../../common/components/StatusBadge/StatusBadge';
import { Shipment } from '../../../common/types/shipment';
import { Tank } from '../../../common/types/tank';
import { StorageTank, Warehouse as WarehouseType } from '../../../common/types/inventory';

interface LogisticsPerformanceProps {
  shipments: Shipment[];
  tanks: Tank[];
  storageTanks: StorageTank[];
  warehouses: WarehouseType[];
}

export default function LogisticsPerformance({ 
  shipments, 
  tanks,
  storageTanks,
  warehouses
}: LogisticsPerformanceProps) {
  // Calculate shipment status breakdown
  const shipmentStatusCount = shipments.reduce((acc, shipment) => {
    acc[shipment.status] = (acc[shipment.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate tank status breakdown
  const tankStatusCount = tanks.reduce((acc, tank) => {
    acc[tank.status] = (acc[tank.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Logistics Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shipments Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Ship className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Shipments</h3>
                <p className="text-sm text-gray-500">Total: {shipments.length}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {Object.entries(shipmentStatusCount)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} size="sm" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {count} shipment{count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Tanks Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Container className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tanks</h3>
                <p className="text-sm text-gray-500">Total: {tanks.length}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {Object.entries(tankStatusCount)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} size="sm" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {count} tank{count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Storage Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Warehouse className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Storage Analysis</h3>
                <p className="text-sm text-gray-500">By type</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {/* Storage Tanks */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Container className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-900">Storage Tanks</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {storageTanks.length} tanks
                </span>
              </div>
              <div className="mt-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Capacity</span>
                  <span>{storageTanks.reduce((sum, tank) => sum + (tank.capacity || 0), 0).toLocaleString()} MT</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Current</span>
                  <span>{storageTanks.reduce((sum, tank) => sum + tank.quantity, 0).toLocaleString()} MT</span>
                </div>
              </div>
            </div>
            {/* Warehouses */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-900">Warehouses</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {warehouses.length} warehouses
                </span>
              </div>
              <div className="mt-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Capacity</span>
                  <span>{warehouses.reduce((sum, wh) => sum + (wh.capacity || 0), 0).toLocaleString()} MT</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Current</span>
                  <span>{warehouses.reduce((sum, wh) => sum + wh.quantity, 0).toLocaleString()} MT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}