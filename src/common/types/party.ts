export interface Party {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  accountManager: string;
  email: string;
  phone: string;
  isccNumber: string;
  isccExpiry: string;
  createdAt: string;
  updatedAt: string;
}

export type PartyType = 'buyers' | 'suppliers';

export interface PartyFormData extends Omit<Party, 'id' | 'createdAt' | 'updatedAt'> {}