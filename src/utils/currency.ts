export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'en-EU',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    locale: 'en-CA',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    locale: 'en-AU',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    locale: 'ja-JP',
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    locale: 'zh-CN',
  },
};

export const formatCurrency = (
  amount: number, 
  currencyCode: string = 'USD',
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  } = {}
): string => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    showSymbol = true,
  } = options;

  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  
  try {
    const formatter = new Intl.NumberFormat(currency.locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency.code,
      minimumFractionDigits,
      maximumFractionDigits,
    });
    
    return formatter.format(amount);
  } catch (error) {
    // Fallback formatting if locale is not supported
    const formattedNumber = amount.toLocaleString('en-US', {
      minimumFractionDigits,
      maximumFractionDigits,
    });
    
    return showSymbol ? `${currency.symbol}${formattedNumber}` : formattedNumber;
  }
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  return currency.symbol;
};

export const getCurrencyName = (currencyCode: string): string => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  return currency.name;
};