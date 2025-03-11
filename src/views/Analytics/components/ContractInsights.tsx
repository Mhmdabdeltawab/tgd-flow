import React from 'react';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  BadgeCheck, 
  BarChart3, 
  CircleDollarSign,
  Package2,
  Ship
} from 'lucide-react';
import { Contract } from '../../../common/types/contract';

interface ContractInsightsProps {
  contracts: Contract[];
}

export default function ContractInsights({ contracts }: ContractInsightsProps) {
  // Calculate metrics
  const supplyContracts = contracts.filter(c => c.type === 'Supply');
  const salesContracts = contracts.filter(c => c.type === 'Sales');
  const totalSupply = supplyContracts.reduce((sum, c) => sum + Number(c.quantity), 0);
  const totalDemand = salesContracts.reduce((sum, c) => sum + Number(c.quantity), 0);
  const supplyDemandGap = totalSupply - totalDemand;
  const activeContracts = contracts.filter(c => c.status === 'opened');
  const pendingContracts = contracts.filter(c => c.status === 'pending');

  // Calculate product type volumes
  const productVolumes = contracts.reduce((acc, contract) => {
    const type = contract.productType;
    const quantity = Number(contract.quantity);
    if (!acc[type]) {
      acc[type] = {
        quantity: 0,
        count: 0
      };
    }
    acc[type].quantity += quantity;
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, { quantity: number; count: number }>);

  // Calculate average prices
  const productPrices = contracts.reduce((acc, contract) => {
    const type = contract.productType;
    const price = Number(contract.unitPrice);
    if (!acc[type]) {
      acc[type] = { total: 0, count: 0 };
    }
    acc[type].total += price;
    acc[type].count++;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  // Calculate payment terms distribution
  const paymentTerms = contracts.reduce((acc, contract) => {
    const terms = contract.paymentTerms;
    acc[terms] = (acc[terms] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate packing standards distribution
  const packingStandards = contracts.reduce((acc, contract) => {
    const standard = contract.packingStandard;
    acc[standard] = (acc[standard] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate port quantities
  const portQuantities = contracts.reduce((acc, contract) => {
    const port = contract.deliveryPort;
    const quantity = Number(contract.quantity);
    if (!acc[port]) {
      acc[port] = {
        total: 0,
        supply: 0,
        sales: 0,
        country: contract.deliveryCountry
      };
    }
    acc[port].total += quantity;
    if (contract.type === 'Supply') {
      acc[port].supply += quantity;
    } else {
      acc[port].sales += quantity;
    }
    return acc;
  }, {} as Record<string, { total: number; supply: number; sales: number; country: string }>);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Performance</h2>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Supply Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">Supply</span>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-semibold text-gray-900">
              {totalSupply.toLocaleString()} MT
            </div>
            <div className="text-sm text-gray-600">Total Supply Volume</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              {activeContracts.length} active contracts
            </div>
          </div>
        </div>

        {/* Demand Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">Demand</span>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-semibold text-gray-900">
              {totalDemand.toLocaleString()} MT
            </div>
            <div className="text-sm text-gray-600">Total Demand Volume</div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <AlertTriangle className="w-4 h-4" />
              {pendingContracts.length} pending contracts
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <CircleDollarSign className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-600">Balance</span>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-semibold text-gray-900">
              {supplyDemandGap.toLocaleString()} MT
            </div>
            <div className="text-sm text-gray-600">Supply-Demand Gap</div>
            <div className="flex items-center gap-1 text-sm text-red-600">
              <TrendingDown className="w-4 h-4" />
              Supply deficit
            </div>
          </div>
        </div>
      </div>

      {/* Product Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Product Types */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Package2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Product Types</h3>
                <p className="text-sm text-gray-500">Volume by product type</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {Object.entries(productVolumes)
              .sort(([, a], [, b]) => b.quantity - a.quantity)
              .map(([type, quantity]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">{type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">
                      {quantity.count} contract{quantity.count !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {quantity.quantity.toLocaleString()} MT
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Average Price */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CircleDollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Average Price</h3>
                <p className="text-sm text-gray-500">By product type</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {Object.entries(productPrices)
              .map(([type, { total, count }]) => ({
                type,
                average: total / count
              }))
              .sort((a, b) => b.average - a.average)
              .map(({ type, average }) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">{type}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    USD {average.toFixed(2)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Contract Terms Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Payment Terms */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <CircleDollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Terms</h3>
                <p className="text-sm text-gray-500">Distribution by type</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {Object.entries(paymentTerms)
              .sort(([, a], [, b]) => b - a)
              .map(([terms, count]) => (
                <div key={terms} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">{terms}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {count} contract{count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Packing Types */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Package2 className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Packing Types</h3>
                <p className="text-sm text-gray-500">Distribution by standard</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {Object.entries(packingStandards)
              .sort(([, a], [, b]) => b - a)
              .map(([standard, count]) => (
                <div key={standard} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">{standard}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {count} contract{count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Port Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Ship className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Port Quantities</h3>
              <p className="text-sm text-gray-500">Expected volumes by port</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(portQuantities)
            .sort(([, a], [, b]) => b.total - a.total)
            .map(([port, data]) => (
              <div key={port} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{port}</div>
                    <div className="text-xs text-gray-500">{data.country}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {data.total.toLocaleString()} MT
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-600">Supply</span>
                    <span className="font-medium text-green-700">
                      {data.supply.toLocaleString()} MT
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600">Sales</span>
                    <span className="font-medium text-blue-700">
                      {data.sales.toLocaleString()} MT
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                      style={{ width: `${(data.sales / data.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}