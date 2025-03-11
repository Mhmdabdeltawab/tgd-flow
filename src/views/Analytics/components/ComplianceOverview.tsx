import React from 'react';
import { BadgeCheck, FileText, AlertCircle, Building2, User } from 'lucide-react';
import { Shipment } from '../../../common/types/shipment';
import { Party } from '../../../common/types/party';
import { Document } from '../../../common/types/document';

interface ComplianceStats {
  total: number;
  withIscc: number;
  withoutIscc: number;
  expiringIscc: Party[];
}

interface ComplianceOverviewProps {
  shipments: Shipment[];
  suppliers: Party[];
  buyers: Party[];
  documents: Record<string, Document[]>;
}

export default function ComplianceOverview({ 
  shipments, 
  suppliers, 
  buyers,
  documents
}: ComplianceOverviewProps) {
  // Calculate document compliance metrics
  const activeShipments = shipments;
  const [sdCount, blCount] = React.useMemo(() => {
    const withSD = activeShipments.filter(s => 
      documents[s.id]?.some(doc => doc.type === 'sustainability_declaration')
    ).length;
    const withBL = activeShipments.filter(s => 
      documents[s.id]?.some(doc => doc.type === 'bill_of_lading')
    ).length;
    return [withSD, withBL];
  }, [activeShipments, documents]);

  // Calculate ISCC compliance stats
  const complianceStats = React.useMemo(() => {
    const allParties = [...suppliers, ...buyers];
    const today = new Date();
    
    const withIscc = allParties.filter(party => party.isccNumber).length;
    const withoutIscc = allParties.length - withIscc;
    
    const expiringIscc = allParties.filter(party => {
      if (!party.isccNumber) return false;
      const expiryDate = new Date(party.isccExpiry);
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 90;
    });

    return {
      total: allParties.length,
      withIscc,
      withoutIscc,
      expiringIscc
    };
  }, [suppliers, buyers]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Overview</h2>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sustainability Declarations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <BadgeCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Sustainability Declarations</h3>
                  <p className="text-sm text-gray-500">Document compliance</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Compliance Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {activeShipments.length ? ((sdCount / activeShipments.length) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ 
                      width: `${activeShipments.length ? (sdCount / activeShipments.length) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Compliant</div>
                  <div className="text-sm font-medium text-green-600">
                    {sdCount} shipments
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Missing</div>
                  <div className="text-sm font-medium text-red-600">
                    {activeShipments.length - sdCount} shipments
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bills of Lading */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Bills of Lading</h3>
                  <p className="text-sm text-gray-500">Document status</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Coverage Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {activeShipments.length ? ((blCount / activeShipments.length) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ 
                      width: `${activeShipments.length ? (blCount / activeShipments.length) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Uploaded</div>
                  <div className="text-sm font-medium text-blue-600">
                    {blCount} shipments
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Pending</div>
                  <div className="text-sm font-medium text-amber-600">
                    -{activeShipments.length - blCount} shipments
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ISCC Compliance */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ISCC Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <BadgeCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">ISCC Status</h3>
                  <p className="text-sm text-gray-500">Partners certification status</p>
                </div>
              </div>
              
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-900">With ISCC</span>
                </div>
                <div className="text-sm font-medium text-green-600">
                  {complianceStats.withIscc} partners
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-900">Without ISCC</span>
                </div>
                <div className="text-sm font-medium text-red-600">
                  {complianceStats.withoutIscc} partners
                </div>
              </div>
            </div>
          </div>

          {/* ISCC Expiry */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">ISCC Expiry</h3>
                  <p className="text-sm text-gray-500">Certifications expiring soon</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
            {complianceStats.expiringIscc.map(party => {
              const expiryDate = new Date(party.isccExpiry);
              const today = new Date();
              const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={party.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {party.id.includes('BUYER') ? (
                        <Building2 className="w-5 h-5 text-gray-400" />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{party.name}</div>
                        <div className="text-xs text-gray-500">
                          ISCC: {party.isccNumber} • Expires {new Date(party.isccExpiry).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-red-600">
                      {daysUntilExpiry} days left
                    </div>
                  </div>
                </div>
              );
            })}
            {complianceStats.expiringIscc.length === 0 && (
              <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BadgeCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">All certifications are up to date</p>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}