export type ContractType = 'Supply' | 'Sales';
export type ContractStatus = 'opened' | 'pending' | 'closed';

export const CONTRACT_STATUSES: ContractStatus[] = ['opened', 'pending', 'closed'];

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
  deliveryDate: string;
  createdAt: string;
  updatedAt: string;
}