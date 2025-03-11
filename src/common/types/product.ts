export interface ProductType {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface ProductQuality {
  ffa: number;
  iv: number;
  s: number;
  m1: number;
}