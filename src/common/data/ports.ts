interface Port {
  id: string;
  name: string;
  country: string;
  countryCode: string;
}

export const ports: Port[] = [
  // Netherlands Ports
  { id: 'RTM', name: 'Rotterdam', country: 'Netherlands', countryCode: 'NL' },
  { id: 'MDK', name: 'Moredijk', country: 'Netherlands', countryCode: 'NL' },
  { id: 'VPK', name: 'Vopak', country: 'Netherlands', countryCode: 'NL' },
  { id: 'AMS', name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL' },
  { id: 'KMP', name: 'Kampen', country: 'Netherlands', countryCode: 'NL' },

  // Egypt Ports
  { id: 'ALX', name: 'Alexandria', country: 'Egypt', countryCode: 'EG' },

  // Italy Ports
  { id: 'GEN', name: 'Genoa', country: 'Italy', countryCode: 'IT' },
  { id: 'NAP', name: 'Naples', country: 'Italy', countryCode: 'IT' },

  // Belgium Ports
  { id: 'ANR', name: 'Antwerp', country: 'Belgium', countryCode: 'BE' },

  // France Ports
  { id: 'LEH', name: 'Le Havre', country: 'France', countryCode: 'FR' },
  { id: 'MRS', name: 'Marseille', country: 'France', countryCode: 'FR' },

  // Portugal Ports
  { id: 'LIS', name: 'Lisbon', country: 'Portugal', countryCode: 'PT' },
  { id: 'LMY', name: 'Limay', country: 'Portugal', countryCode: 'PT' },

  // UK Ports
  { id: 'LGW', name: 'London-Gateway', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'LPL', name: 'Liverpool', country: 'United Kingdom', countryCode: 'GB' },

  // Spain Ports
  { id: 'ALG', name: 'Algeciras', country: 'Spain', countryCode: 'ES' },
  { id: 'BCN', name: 'Barcelona', country: 'Spain', countryCode: 'ES' },

  // China Ports
  { id: 'NSH', name: 'Nansha', country: 'China', countryCode: 'CN' },
  { id: 'SHA', name: 'Shanghai', country: 'China', countryCode: 'CN' },
  { id: 'SZX', name: 'Shenzhen', country: 'China', countryCode: 'CN' },

  // Singapore Ports
  { id: 'SIN', name: 'Singapore', country: 'Singapore', countryCode: 'SG' },

  // United States Ports
  { id: 'LAX', name: 'Los Angeles', country: 'United States', countryCode: 'US' },
  { id: 'NYC', name: 'New York', country: 'United States', countryCode: 'US' },
  { id: 'HOU', name: 'Houston', country: 'United States', countryCode: 'US' },
];

// Helper function to get ports by country
export function getPortsByCountry(country: string): Port[] {
  return ports.filter(port => port.country === country);
}

// Helper function to get port by ID
export function getPortById(id: string): Port | undefined {
  return ports.find(port => port.id === id);
}

// Helper function to get port by name
export function getPortByName(name: string): Port | undefined {
  return ports.find(port => port.name === name);
}