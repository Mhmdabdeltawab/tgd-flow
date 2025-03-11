import { TankQuality, QUALITY_RANGES } from '../types/tank';
import { Contract } from '../types/contract';

export interface QualityValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

// Validate quality parameters against ranges
export function validateQualityRanges(quality: TankQuality): QualityValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  let isValid = true;

  Object.entries(quality).forEach(([key, value]) => {
    const range = QUALITY_RANGES[key as keyof TankQuality];
    if (value === undefined || value === null) {
      errors[key] = 'Value is required';
      isValid = false;
    } else if (value < range.min || value > range.max) {
      errors[key] = `Must be between ${range.min} and ${range.max}`;
      isValid = false;
    }
  });

  return { isValid, errors, warnings };
}

// Validate quality against contract specifications
export function validateQualityAgainstContract(
  quality: TankQuality,
  contract: Contract
): QualityValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  let isValid = true;

  // FFA validation with 10% tolerance
  const ffaSpec = Number(contract.qualityFFA);
  const ffaMax = ffaSpec * 1.1;
  if (quality.FFA > ffaMax) {
    warnings.FFA = `Above contract spec (${ffaSpec})`;
  } else if (quality.FFA > ffaSpec) {
    warnings.FFA = `Above contract spec (${ffaSpec})`;
  }

  // IV validation with ±5 tolerance
  const ivSpec = Number(contract.qualityIV);
  if (Math.abs(quality.IV - ivSpec) > 5) {
    warnings.IV = `Outside contract spec range (${ivSpec} ± 5)`;
  }

  // Sulfur validation with 10% tolerance
  const sSpec = Number(contract.qualityS);
  const sMax = sSpec * 1.1;
  if (quality.S > sMax) {
    warnings.S = `Above contract spec (${sSpec})`;
  } else if (quality.S > sSpec) {
    warnings.S = `Above contract spec (${sSpec})`;
  }

  // M&I validation with 10% tolerance
  const miSpec = Number(contract.qualityM1);
  const miMax = miSpec * 1.1;
  if (quality.MI > miMax) {
    warnings.MI = `Above contract spec (${miSpec})`;
  } else if (quality.MI > miSpec) {
    warnings.MI = `Above contract spec (${miSpec})`;
  }

  return { isValid, errors, warnings };
}

// Calculate weighted average quality
export function calculateWeightedQuality(
  tanks: { quantity: number; quality: TankQuality | null }[]
): TankQuality | null {
  const tanksWithQuality = tanks.filter(tank => tank.quality !== null);
  
  if (tanksWithQuality.length === 0) {
    return null;
  }

  const totalQuantity = tanksWithQuality.reduce((sum, tank) => sum + tank.quantity, 0);
  
  const weightedQuality: TankQuality = {
    FFA: 0,
    IV: 0,
    S: 0,
    MI: 0
  };

  tanksWithQuality.forEach(tank => {
    if (tank.quality) {
      const weight = tank.quantity / totalQuantity;
      weightedQuality.FFA += tank.quality.FFA * weight;
      weightedQuality.IV += tank.quality.IV * weight;
      weightedQuality.S += tank.quality.S * weight;
      weightedQuality.MI += tank.quality.MI * weight;
    }
  });

  return weightedQuality;
}