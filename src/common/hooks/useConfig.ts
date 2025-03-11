import { useState, useEffect } from 'react';
import { configStore } from '../stores/configStore';

export function useConfig() {
  const [currencies] = useState(() => configStore.getCurrencies());
  const [incoterms] = useState(() => configStore.getIncoterms());
  const [packingStandards] = useState(() => configStore.getPackingStandards());
  const [paymentTerms] = useState(() => configStore.getPaymentTerms());
  const [productTypes] = useState(() => configStore.getProductTypes());

  return {
    currencies,
    incoterms,
    packingStandards,
    paymentTerms,
    productTypes,
    formatCurrency: configStore.formatCurrency,
    getCurrencyByCode: configStore.getCurrencyByCode
  };
}