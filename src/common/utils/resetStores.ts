import { partyStore } from '../stores/partyStore';
import { contractsStore } from '../stores/contractsStore';
import { shipmentStore } from '../stores/shipmentStore';
import { documentStore } from '../stores/documentStore';
import { inventoryStore } from '../stores/inventoryStore';

export function resetAllStores() {
  // Clear all localStorage data
  localStorage.clear();
  
  // Create sample data with proper relationships
  const sampleSuppliers = [
    {
      id: 'SUPPLIER001',
      name: 'EcoFuel Solutions GmbH',
      country: 'Germany',
      countryCode: 'DE',
      accountManager: 'Michael Schmidt',
      email: 'michael.schmidt@ecofuel.de',
      phone: '+49 30 123 4567',
      isccNumber: 'EU-ISCC-535089',
      isccExpiry: '2027-02-04',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'SUPPLIER002',
      name: 'Global Waste Management Inc',
      country: 'United States',
      countryCode: 'US',
      accountManager: 'Sarah Johnson',
      email: 'sarah.j@gwm.com',
      phone: '+1 925-798-3072',
      isccNumber: 'EU-ISCC-662152',
      isccExpiry: '2027-02-04',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const sampleBuyers = [
    {
      id: 'BUYER001',
      name: 'Rotterdam Biofuels BV',
      country: 'Netherlands',
      countryCode: 'NL',
      accountManager: 'Jan van der Berg',
      email: 'j.vandenberg@rbv.nl',
      phone: '+31 10 123 4567',
      isccNumber: 'EU-ISCC-789012',
      isccExpiry: '2027-02-04',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'BUYER002',
      name: 'Hamburg Green Energy AG',
      country: 'Germany',
      countryCode: 'DE',
      accountManager: 'Anna Weber',
      email: 'a.weber@hge.de',
      phone: '+49 40 987 6543',
      isccNumber: 'EU-ISCC-891234',
      isccExpiry: '2027-03-15',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const sampleTerminals = [
    {
      id: 'TRM001',
      name: 'Rotterdam Terminal Alpha',
      country: 'Netherlands',
      port: 'Rotterdam',
      wasteTypes: ['UCO', 'PFAD', 'Acid Oil'],
      capacity: 50000,
      storageTankCount: 2,
      totalQuantity: 15000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'TRM002',
      name: 'Hamburg Terminal Beta',
      country: 'Germany',
      port: 'Hamburg',
      wasteTypes: ['UCO', 'PFAD'],
      capacity: 35000,
      storageTankCount: 1,
      totalQuantity: 10000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const sampleStorageTanks = [
    {
      id: 'TNK001',
      name: 'Tank A1',
      terminalId: 'TRM001',
      operatorId: 'SUPPLIER001',
      operatorName: 'EcoFuel Solutions GmbH',
      capacity: 25000,
      wasteTypes: ['UCO', 'PFAD'],
      quantity: 8000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'TNK002',
      name: 'Tank B1',
      terminalId: 'TRM002',
      operatorId: 'SUPPLIER002',
      operatorName: 'Global Waste Management Inc',
      capacity: 20000,
      wasteTypes: ['UCO'],
      quantity: 5000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const sampleWarehouses = [
    {
      id: 'WRH001',
      name: 'Rotterdam Eco Storage',
      country: 'Netherlands',
      port: 'Rotterdam',
      operatorId: 'SUPPLIER001',
      operatorName: 'EcoFuel Solutions GmbH',
      capacity: 10000,
      wasteTypes: ['UCO'],
      quantity: 3000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'WRH002',
      name: 'Hamburg Green Hub',
      country: 'Germany',
      port: 'Hamburg',
      operatorId: 'SUPPLIER002',
      operatorName: 'Global Waste Management Inc',
      capacity: 15000,
      wasteTypes: ['UCO', 'PFAD'],
      quantity: 7000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const sampleContracts = [
    {
      id: 'UCO-SUPPLIER-US-240209-001',
      type: 'Supply',
      status: 'opened',
      buyerId: 'BUYER001',
      sellerId: 'SUPPLIER001',
      buyerName: 'Rotterdam Biofuels BV',
      sellerName: 'EcoFuel Solutions GmbH',
      productType: 'UCO',
      incoterm: 'FOB',
      quantity: '5000',
      allowedVariance: '5',
      unitPrice: '850',
      currency: 'USD',
      paymentTerms: 'CAD_90',
      qualityFFA: '5',
      qualityIV: '85',
      qualityS: '2',
      qualityM1: '1',
      packingStandard: 'ISO Standard',
      originCountry: 'Germany',
      deliveryCountry: 'Netherlands',
      deliveryPort: 'Rotterdam',
      loadingStartDate: '2024-03-15',
      deliveryDate: '2024-04-15',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PFAD-SUPPLIER-US-240209-002',
      type: 'Supply',
      status: 'opened',
      buyerId: 'BUYER002',
      sellerId: 'SUPPLIER002',
      buyerName: 'Hamburg Green Energy AG',
      sellerName: 'Global Waste Management Inc',
      productType: 'PFAD',
      incoterm: 'CIF',
      quantity: '3000',
      allowedVariance: '5',
      unitPrice: '780',
      currency: 'USD',
      paymentTerms: 'LC_60',
      qualityFFA: '4.5',
      qualityIV: '82',
      qualityS: '1.8',
      qualityM1: '0.7',
      packingStandard: 'ISO Standard',
      originCountry: 'United States',
      deliveryCountry: 'Germany',
      deliveryPort: 'Hamburg',
      loadingStartDate: '2024-04-01',
      deliveryDate: '2024-05-01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const sampleShipments = [
    {
      id: 'UCO-SUPPLIER-US-240209-001-SH-001',
      type: 'Supply',
      status: 'in_transit',
      contractId: 'UCO-SUPPLIER-US-240209-001',
      productType: 'UCO',
      quantity: 2500,
      quality: {
        weightedAverageFFA: 5,
        weightedAverageIV: 85,
        weightedAverageS: 2,
        weightedAverageM1: 0.8
      },
      billOfLading: [
        {
          id: 'BL-001',
          status: 'loaded',
          number: 'BL123456',
          issuedAt: '2024-02-20T00:00:00.000Z',
          loadedAt: '2024-02-20T00:00:00.000Z'
        }
      ],
      departureDate: '2024-03-15',
      arrivalDate: '2024-04-15',
      terminal: 'Rotterdam Terminal Alpha',
      port: 'Rotterdam',
      country: 'Netherlands',
      shippingLine: 'Pacific Star',
      isFulfilled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Store updated sample data
  localStorage.setItem('suppliers', JSON.stringify(sampleSuppliers));
  localStorage.setItem('buyers', JSON.stringify(sampleBuyers));
  localStorage.setItem('terminals', JSON.stringify(sampleTerminals));
  localStorage.setItem('storageTanks', JSON.stringify(sampleStorageTanks));
  localStorage.setItem('warehouses', JSON.stringify(sampleWarehouses));
  localStorage.setItem('contracts', JSON.stringify(sampleContracts));
  localStorage.setItem('shipments', JSON.stringify(sampleShipments));

  // Force reload the page to ensure all stores are fresh
  window.location.reload();
}