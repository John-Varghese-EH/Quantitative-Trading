import { useAppStore } from '@/store/useAppStore';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
};

export const formatCurrency = (value: number, currency: string = 'USD', decimals: number = 2): string => {
  if (value === undefined || value === null || isNaN(value)) return '-';
  
  const rates = useAppStore.getState().exchangeRates;
  const rate = rates[currency] || 1;
  const convertedValue = value * rate;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(convertedValue);
};

export const formatCurrencyCompact = (value: number, currency: string = 'USD'): string => {
  if (value === undefined || value === null || isNaN(value)) return '-';
  
  const rates = useAppStore.getState().exchangeRates;
  const rate = rates[currency] || 1;
  const convertedValue = value * rate;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(convertedValue);
};

