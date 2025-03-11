export type TankStatus = 'Loaded' | 'Discharged' | 'In Transit' | 'Delivered' | 'Received' | 'Cancelled';

// Quality parameters with validation ranges
export interface TankQuality {
  FFA: number; // Free Fatty Acid (0-100)
  IV: number;  // Iodine Value (0-200)
  S: number;   // Sulfur (0-100)
  MI: number;  // Moisture & Impurities (0-100)
}

// Quality validation ranges
export const QUALITY_RANGES = {
  FFA: { min: 0, max: 100 },
  IV: { min: 0, max: 200 },
  S: { min: 0, max: 100 },
  MI: { min: 0, max: 100 }
} as const;

// Helper type for quality validation results
export interface QualityValidation {
  isValid: boolean;
  errors: Partial<Record<keyof TankQuality, string>>;
}

export interface Tank {
  id: string;
  shipmentId: string;
  status: TankStatus;
  quantity: number;
  quality: TankQuality | null; // Allow null for tanks without quality data
  departureDate: string;
  arrivalDate: string;
  createdAt: string;
  updatedAt: string;
}