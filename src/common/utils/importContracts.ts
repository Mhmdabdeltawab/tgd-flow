import { Contract } from '../stores/contractsStore';
import { countries } from '../data/countries';
import { currencies } from '../data/currencies';
import { incoterms } from '../data/incoterms';
import { packingStandards } from '../data/packingStandards';
import { paymentTerms } from '../data/paymentTerms';
import { productTypes } from '../data/productTypes';

interface ImportResult {
  success: boolean;
  data?: Partial<Contract>;
  errors: string[];
  warnings: string[];
}

interface ImportSummary {
  total: number;
  successful: number;
  warnings: number;
  failed: number;
  results: ImportResult[];
}

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

export function validateAndMapContract(row: string[], headers: string[]): ImportResult {
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

  // Required fields
  const requiredFields = [
    { field: 'type', values: ['buy', 'sell'] },
    { field: 'productType', values: productTypes },
    { field: 'incoterm', values: incoterms },
    { field: 'currency', values: currencies.map(c => c.code) },
    { field: 'paymentTerms', values: paymentTerms },
    { field: 'packingStandard', values: packingStandards },
  ];

  // Validate required fields
  requiredFields.forEach(({ field, values }) => {
    const value = getValue(field);
    if (!value) {
      result.errors.push(`Missing required field: ${field}`);
      result.success = false;
    } else if (values && !values.includes(value)) {
      result.errors.push(`Invalid ${field}: ${value}. Must be one of: ${values.join(', ')}`);
      result.success = false;
    } else {
      result.data![field] = value;
    }
  });

  // Validate and map numeric fields
  const numericFields = [
    { field: 'quantity', min: 0 },
    { field: 'allowedVariance', min: 0, max: 100 },
    { field: 'unitPrice', min: 0 },
    { field: 'qualityFFA', min: 0 },
    { field: 'qualityIV', min: 0 },
    { field: 'qualityS', min: 0 },
    { field: 'qualityM1', min: 0 }
  ];

  numericFields.forEach(({ field, min, max }) => {
    const value = getValue(field);
    if (value) {
      const num = parseFloat(value);
      if (isNaN(num)) {
        result.warnings.push(`Invalid number for ${field}: ${value}`);
      } else if (min !== undefined && num < min) {
        result.warnings.push(`${field} must be greater than ${min}`);
      } else if (max !== undefined && num > max) {
        result.warnings.push(`${field} must be less than ${max}`);
      } else {
        result.data![field] = num.toString();
      }
    } else {
      result.warnings.push(`Missing ${field}`);
    }
  });

  // Validate and map dates
  const dateFields = ['loadingStartDate', 'deliveryDate'];
  dateFields.forEach(field => {
    const value = getValue(field);
    if (value) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        result.warnings.push(`Invalid date for ${field}: ${value}`);
      } else {
        result.data![field] = date.toISOString().split('T')[0];
      }
    } else {
      result.warnings.push(`Missing ${field}`);
    }
  });

  // Map party names
  ['buyerName', 'sellerName'].forEach(field => {
    const value = getValue(field);
    if (value) {
      result.data![field] = value;
    } else {
      result.warnings.push(`Missing ${field}`);
    }
  });

  // Validate countries
  ['originCountry', 'deliveryCountry'].forEach(field => {
    const value = getValue(field);
    if (value) {
      const country = countries.find(c => 
        c.name.toLowerCase() === value.toLowerCase() || 
        c.code.toLowerCase() === value.toLowerCase()
      );
      if (country) {
        result.data![field] = country.name;
      } else {
        result.warnings.push(`Unknown country for ${field}: ${value}`);
      }
    } else {
      result.warnings.push(`Missing ${field}`);
    }
  });

  // Map port
  const port = getValue('deliveryPort');
  if (port) {
    result.data!.deliveryPort = port;
  } else {
    result.warnings.push('Missing deliveryPort');
  }

  return result;
}

export function generateImportTemplate(): string {
  const headers = [
    'type',
    'buyerName',
    'sellerName',
    'productType',
    'incoterm',
    'quantity',
    'allowedVariance',
    'unitPrice',
    'currency',
    'paymentTerms',
    'qualityFFA',
    'qualityIV',
    'qualityS',
    'qualityM1',
    'packingStandard',
    'originCountry',
    'deliveryCountry',
    'deliveryPort',
    'loadingStartDate',
    'deliveryDate'
  ];

  const sampleData = [
    'buy',
    'Sample Buyer Corp',
    'Sample Supplier Ltd',
    'UCO',
    'FOB',
    '1000',
    '5',
    '850',
    'USD',
    'CAD_90',
    '5',
    '85',
    '2',
    '1',
    'ISO Standard',
    'United States',
    'Germany',
    'Hamburg',
    '2024-03-15',
    '2024-04-15'
  ];

  return [
    headers.join(','),
    sampleData.join(',')
  ].join('\n');
}