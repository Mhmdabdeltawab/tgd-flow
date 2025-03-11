export type ShipmentType = 'Supply' | 'Sales';
export type ShipmentStatus = 'scheduled' | 'in_transit' | 'delivered' | 'received' | 'cancelled';

export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  'scheduled',
  'in_transit',
  'delivered',
  'received',
  'cancelled'
];

// Quality parameters for shipments
export interface ShipmentQuality {
  weightedAverageFFA: number;
  weightedAverageIV: number;
  weightedAverageS: number;
  weightedAverageM1: number;
}

export type BLStatus = 'pending' | 'loaded' | 'delivered';
export type DocumentType = 'sustainability_declaration' | 'packing_list' | 'insurance_certificate';

export interface ShipmentDocument {
  id: string;
  type: DocumentType;
  name: string;
  uploadedAt: string;
  status?: BLStatus;
  number?: string;
  issuedAt?: string;
  loadedAt?: string;
  deliveredAt?: string;
}

export interface Shipment {
  id: string;
  type: ShipmentType;
  status: ShipmentStatus;
  contractId: string;
  productType: string;
  quantity: number;
  quality: ShipmentQuality | null; // Allow null for shipments without tanks
  billOfLading: {
    id: string;
    status: BLStatus;
    number?: string;
    issuedAt?: string;
    loadedAt?: string;
    deliveredAt?: string;
  }[];
  departureDate: string;
  arrivalDate: string;
  terminal: string;
  port: string;
  country: string;
  shippingLine: string;
  isFulfilled: boolean;
  routingDetails?: {
    routedToContractId: string;
    routedAt: string;
    routedBy: string;
  };
  fulfillmentDetails?: {
    fulfilledAt: string;
    fulfilledBy: string;
    notes?: string;
  };
  documents?: {
    bl: ShipmentDocument[];
    other: ShipmentDocument[];
  };
  createdAt: string;
  updatedAt: string;
}