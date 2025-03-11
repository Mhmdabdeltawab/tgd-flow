// Define base country interface
interface Country {
  code: string;
  name: string;
}

// Define comprehensive list of countries
const allCountries: Country[] = [
  // Europe
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GB', name: 'United Kingdom' },
  
  // Asia
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'ID', name: 'Indonesia' },
  
  // Americas
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },
  
  // Middle East & Africa
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'ZA', name: 'South Africa' }
];

// Export the countries array
export const countries = allCountries;

// Helper function to get country by code
export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

// Helper function to get country by name
export const getCountryByName = (name: string): Country | undefined => {
  return countries.find(country => country.name === name);
};

// Export the Country type for use in other files
export type { Country };