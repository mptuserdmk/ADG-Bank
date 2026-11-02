import { describe, it, expect } from 'vitest';
import { getCurrencyParts } from '../currency';

describe('getCurrencyParts utility', () => {
  it('formats EUR currency correctly', () => {
    const result = getCurrencyParts(1250.50, 'EUR', 'ru-RU');
    expect(result).toBeDefined();
    expect(result.currencySymbol).toBe('€');
    // ru-RU format uses non-breaking space
    expect(result.value.replace(/\s+/g, ' ')).toContain('1 250,50');
  });

  it('formats USD currency correctly', () => {
    const result = getCurrencyParts(350, 'USD', 'ru-RU');
    expect(result).toBeDefined();
    expect(result.currencySymbol).toBe('$');
    expect(result.value).toContain('350,00');
  });

  it('formats RUB currency correctly', () => {
    const result = getCurrencyParts(45000, 'RUB', 'ru-RU');
    expect(result).toBeDefined();
    expect(result.currencySymbol).toBe('₽');
    expect(result.value.replace(/\s+/g, ' ')).toContain('45 000,00');
  });

  it('handles zero and decimal boundary numbers accurately', () => {
    const zeroResult = getCurrencyParts(0, 'EUR', 'ru-RU');
    expect(zeroResult.value).toBe('0,00');

    const centResult = getCurrencyParts(0.05, 'EUR', 'ru-RU');
    expect(centResult.value).toBe('0,05');
  });

  it('falls back gracefully on unknown currency code', () => {
    const result = getCurrencyParts(100, 'XYZ', 'ru-RU');
    expect(result).toBeDefined();
    expect(result.fullFormatted).toBeDefined();
  });
});

