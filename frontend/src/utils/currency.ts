export interface CurrencyFormatParts {
  value: string;
  currencySymbol: string;
  fullFormatted: string;
}

export const getCurrencyParts = (
  amount: number,
  currency = 'EUR',
  locale = 'ru-RU'
): CurrencyFormatParts => {
  const safeCurrency = (currency || 'EUR').toUpperCase();
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const parts = formatter.formatToParts(amount);
    const currencySymbol = parts.find((p) => p.type === 'currency')?.value || safeCurrency;
    const value = parts
      .filter((p) => p.type !== 'currency')
      .map((p) => p.value)
      .join('')
      .trim();

    return {
      value,
      currencySymbol,
      fullFormatted: formatter.format(amount),
    };
  } catch {
    const fallbackSymbols: Record<string, string> = {
      EUR: '€',
      USD: '$',
      RUB: '₽',
      GBP: '£',
    };
    const symbol = fallbackSymbols[safeCurrency] || safeCurrency;
    const num = amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return {
      value: num,
      currencySymbol: symbol,
      fullFormatted: `${num} ${symbol}`,
    };
  }
};

export const getExchangeRate = (fromCurr: string, toCurr: string): number => {
  const f = (fromCurr || 'EUR').toUpperCase();
  const t = (toCurr || 'USD').toUpperCase();
  if (f === t) return 1;

  // Base rates in EUR
  const toEurRates: Record<string, number> = {
    EUR: 1.0,
    USD: 0.92,
    RUB: 0.0098,
    GBP: 1.17,
    BTC: 64280.0,
  };

  const fromInEur = toEurRates[f] ?? 1.0;
  const toInEur = toEurRates[t] ?? 1.0;

  // e.g. 1 EUR in USD = 1.0 / 0.92 = 1.087
  // e.g. 1 BTC in EUR = 64280 / 1.0 = 64280
  const rate = fromInEur / toInEur;
  return rate;
};


