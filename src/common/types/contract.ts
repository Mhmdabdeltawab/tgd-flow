export type ContractType = "Supply" | "Sales";
export type ContractStatus = "opened" | "pending" | "closed";

export const CONTRACT_STATUSES: ContractStatus[] = [
  "opened",
  "pending",
  "closed",
];

export type LoadingDuration = "week" | "month" | "quarter";

export const LOADING_DURATIONS: LoadingDuration[] = [
  "week",
  "month",
  "quarter",
];

export interface BrokerDetails {
  name: string;
  fees: string; // Using string to maintain consistency with other numeric fields
}

export interface Contract {
  id: string;
  type: ContractType;
  status: ContractStatus;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  productType: string;
  incoterm: string;
  quantity: string;
  allowedVariance: string;
  unitPrice: string;
  currency: string;
  paymentTerms: string;
  qualityFFA: string;
  qualityIV: string;
  qualityS: string;
  qualityM1: string;
  packingStandard: string;
  originCountry: string;
  deliveryCountry: string;
  deliveryPort: string;
  loadingStartDate: string;
  loadingPeriod: string; // New field for loading period (days)
  loadingDuration: LoadingDuration; // New field for loading duration
  deliveryDate: string;
  externalReferenceId?: string; // External reference ID used by other party
  broker?: BrokerDetails; // Optional broker details
  createdAt: string;
  updatedAt: string;
}
