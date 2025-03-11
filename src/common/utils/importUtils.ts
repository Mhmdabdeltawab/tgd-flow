import { countries } from '../data/countries';
import { currencies } from '../data/currencies';
import { incoterms } from '../data/incoterms';
import { packingStandards } from '../data/packingStandards';
import { paymentTerms } from '../data/paymentTerms';
import { ports } from '../data/ports';
import { productTypes } from '../data/productTypes';

export interface ImportResult {
  success: boolean;
  data?: Record<string, any>;
  errors: string[];
  warnings: string[];
}

export interface ImportConfig {
  requiredFields: {
    field: string;
    values?: string[];
    type?: 'string' | 'number' | 'date' | 'email' | 'phone';
    min?: number;
    max?: number;
  }[];
  optionalFields?: {
    field: string;
    values?: string[];
    type?: 'string' | 'number' | 'date' | 'email' | 'phone';
    min?: number;
    max?: number;
  }[];
  sampleData: Record<string, any>;
}

export const IMPORT_CONFIGS = {
  contracts: {
    requiredFields: [
      { field: 'type', values: ['buy', 'sell'] },
      { field: 'productType', values: productTypes },
      { field: 'incoterm', values: incoterms },
      { field: 'currency', values: currencies.map(c => c.code) },
      { field: 'paymentTerms', values: paymentTerms },
      { field: 'packingStandard', values: packingStandards },
      { field: 'quantity', type: 'number', min: 0 },
      { field: 'allowedVariance', type: 'number', min: 0, max: 100 },
      { field: 'unitPrice', type: 'number', min: 0 },
      { field: 'qualityFFA', type: 'number', min: 0 },
      { field: 'qualityIV', type: 'number', min: 0 },
      { field: 'qualityS', type: 'number', min: 0 },
      { field: 'qualityM1', type: 'number', min: 0 },
      { field: 'originCountry', values: countries.map(c => c.name) },
      { field: 'deliveryCountry', values: countries.map(c => c.name) },
      { field: 'deliveryPort', values: ports.map(p => p.name) },
      { field: 'loadingStartDate', type: 'date' },
      { field: 'deliveryDate', type: 'date' },
      { field: 'buyerName', type: 'string' },
      { field: 'sellerName', type: 'string' }
    ],
    sampleData: {
      type: 'buy',
      buyerName: 'Sample Buyer Corp',
      sellerName: 'Sample Supplier Ltd',
      productType: 'UCO',
      incoterm: 'FOB',
      quantity: '1000',
      allowedVariance: '5',
      unitPrice: '850',
      currency: 'USD',
      paymentTerms: 'CAD_90',
      qualityFFA: '5',
      qualityIV: '85',
      qualityS: '2',
      qualityM1: '1',
      packingStandard: 'ISO Standard',
      originCountry: 'United States',
      deliveryCountry: 'Germany',
      deliveryPort: 'Hamburg',
      loadingStartDate: '2024-03-15',
      deliveryDate: '2024-04-15'
    }
  },
  suppliers: {
    requiredFields: [
      { field: 'name', type: 'string' },
      { field: 'country', values: countries.map(c => c.name) },
      { field: 'countryCode', values: countries.map(c => c.code) },
      { field: 'accountManager', type: 'string' },
      { field: 'email', type: 'email' },
      { field: 'phone', type: 'phone' },
      { field: 'isccNumber', type: 'string' },
      { field: 'isccExpiry', type: 'date' }
    ],
    sampleData: {
      name: 'Sample Supplier GmbH',
      country: 'Germany',
      countryCode: 'DE',
      accountManager: 'John Smith',
      email: 'john.smith@supplier.com',
      phone: '+49 123 456789',
      isccNumber: 'EU-ISCC-123456',
      isccExpiry: '2025-12-31'
    }
  },
  buyers: {
    requiredFields: [
      { field: 'name', type: 'string' },
      { field: 'country', values: countries.map(c => c.name) },
      { field: 'countryCode', values: countries.map(c => c.code) },
      { field: 'accountManager', type: 'string' },
      { field: 'email', type: 'email' },
      { field: 'phone', type: 'phone' },
      { field: 'isccNumber', type: 'string' },
      { field: 'isccExpiry', type: 'date' }
    ],
    sampleData: {
      name: 'Sample Buyer Corp',
      country: 'United States',
      countryCode: 'US',
      accountManager: 'Jane Doe',
      email: 'jane.doe@buyer.com',
      phone: '+1 234 567890',
      isccNumber: 'EU-ISCC-789012',
      isccExpiry: '2025-12-31'
    }
  }
};

export async function parseImportFile(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').map(row => 
          row.split(',').map(cell => cell.trim().replace(/^"(.*)"$/, '$1'))
        );
        resolve(rows);
      } catch (error) {
        reject(new Error('Failed to parse file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function validateAndMapData(row: string[], headers: string[], config: ImportConfig): ImportResult {
  const result: ImportResult = {
    success: true,
    data: {},
    errors: [],
    warnings: []
  };

  const getValue = (field: string) => {
    const index = headers.findIndex(h => h.toLowerCase() === field.toLowerCase());
    return index >= 0 ? row[index] : null;
  };

  // Validate required fields
  config.requiredFields.forEach(({ field, values, type, min, max }) => {
    const value = getValue(field);
    
    if (!value) {
      result.errors.push(`Missing required field: ${field}`);
      result.success = false;
      return;
    }

    // Validate against allowed values
    if (values && !values.includes(value)) {
      result.errors.push(`Invalid ${field}: ${value}. Must be one of: ${values.join(', ')}`);
      result.success = false;
      return;
    }

    // Type validation
    switch (type) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) {
          result.errors.push(`Invalid number for ${field}: ${value}`);
          result.success = false;
          return;
        }
        if (min !== undefined && num < min) {
          result.errors.push(`${field} must be greater than ${min}`);
          result.success = false;
          return;
        }
        if (max !== undefined && num > max) {
          result.errors.push(`${field} must be less than ${max}`);
          result.success = false;
          return;
        }
        result.data![field] = num.toString();
        break;

      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          result.errors.push(`Invalid date for ${field}: ${value}`);
          result.success = false;
          return;
        }
        result.data![field] = date.toISOString().split('T')[0];
        break;

      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          result.errors.push(`Invalid email for ${field}: ${value}`);
          result.success = false;
          return;
        }
        result.data![field] = value;
        break;

      case 'phone':
        if (!/^\+?[\d\s-]+$/.test(value)) {
          result.errors.push(`Invalid phone number for ${field}: ${value}`);
          result.success = false;
          return;
        }
        result.data![field] = value;
        break;

      default:
        result.data![field] = value;
    }
  });

  // Validate optional fields if present
  config.optionalFields?.forEach(({ field, values, type, min, max }) => {
    const value = getValue(field);
    if (!value) return;

    // Apply same validation logic as required fields
    if (values && !values.includes(value)) {
      result.warnings.push(`Invalid ${field}: ${value}. Must be one of: ${values.join(', ')}`);
      return;
    }

    switch (type) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) {
          result.warnings.push(`Invalid number for ${field}: ${value}`);
          return;
        }
        if (min !== undefined && num < min) {
          result.warnings.push(`${field} must be greater than ${min}`);
          return;
        }
        if (max !== undefined && num > max) {
          result.warnings.push(`${field} must be less than ${max}`);
          return;
        }
        result.data![field] = num.toString();
        break;

      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          result.warnings.push(`Invalid date for ${field}: ${value}`);
          return;
        }
        result.data![field] = date.toISOString().split('T')[0];
        break;

      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          result.warnings.push(`Invalid email for ${field}: ${value}`);
          return;
        }
        result.data![field] = value;
        break;

      case 'phone':
        if (!/^\+?[\d\s-]+$/.test(value)) {
          result.warnings.push(`Invalid phone number for ${field}: ${value}`);
          return;
        }
        result.data![field] = value;
        break;

      default:
        result.data![field] = value;
    }
  });

  return result;
}

export function generateImportTemplate(config: ImportConfig): string {
  const headers = [...config.requiredFields.map(f => f.field)];
  if (config.optionalFields) {
    headers.push(...config.optionalFields.map(f => f.field));
  }

  const sampleData = Object.values(config.sampleData);

  return [
    headers.join(','),
    sampleData.join(',')
  ].join('\n');
}