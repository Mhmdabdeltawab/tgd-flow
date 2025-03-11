import { currencies } from '../data/currencies';
import { incoterms } from '../data/incoterms';
import { packingStandards } from '../data/packingStandards';
import { paymentTerms } from '../data/paymentTerms';
import { productTypes } from '../data/productTypes';

// Configuration store for managing static data
export const configStore = {
  getCurrencies: () => currencies,
  getIncoterms: () => incoterms,
  getPackingStandards: () => packingStandards,
  getPaymentTerms: () => paymentTerms,
  getProductTypes: () => productTypes,
  
  // Helper to get currency by code
  getCurrencyByCode: (code: string) => {
    return currencies.find(currency => currency.code === code);
  },

  // Helper to format currency amount
  formatCurrency: (amount: number | string, currencyCode: string) => {
    const currency = configStore.getCurrencyByCode(currencyCode);
    if (!currency) return `${currencyCode} ${amount}`;
    return `${currency.symbol}${amount}`;
  }
};