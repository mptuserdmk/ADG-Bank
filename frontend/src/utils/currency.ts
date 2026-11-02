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

