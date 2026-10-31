import { formatINR, parseAmountToPaise } from '@/domain/money';

describe('formatINR', () => {
  test('groups lakhs and crores the Indian way', () => {
    expect(formatINR(12500000)).toBe('₹1,25,000');
    expect(formatINR(10000000000)).toBe('₹10,00,00,000');
  });
  test('shows paise only when not whole rupees', () => {
    expect(formatINR(124050)).toBe('₹1,240.50');
    expect(formatINR(0)).toBe('₹0');
  });
  test('adds a sign when asked', () => {
    expect(formatINR(-41200, { sign: true })).toBe('−₹412');
    expect(formatINR(41200, { sign: true })).toBe('+₹412');
  });
});

describe('parseAmountToPaise', () => {
  test('accepts commas, rupee symbol and leading dot', () => {
    expect(parseAmountToPaise('1,250.50')).toEqual({ ok: true, paise: 125050 });
    expect(parseAmountToPaise('₹ 999')).toEqual({ ok: true, paise: 99900 });
    expect(parseAmountToPaise('.5')).toEqual({ ok: true, paise: 50 });
  });
  test('rejects empty, zero, negative, junk and extra decimals', () => {
    expect(parseAmountToPaise('')).toEqual({ ok: false, error: 'empty' });
    expect(parseAmountToPaise('0')).toEqual({ ok: false, error: 'zero' });
    expect(parseAmountToPaise('12.345')).toEqual({ ok: false, error: 'invalid' });
    expect(parseAmountToPaise('-5')).toEqual({ ok: false, error: 'invalid' });
    expect(parseAmountToPaise('abc')).toEqual({ ok: false, error: 'invalid' });
  });
  test('rejects amounts above ₹99,99,99,999', () => {
    expect(parseAmountToPaise('1000000000')).toEqual({ ok: false, error: 'too_large' });
    expect(parseAmountToPaise('999999999')).toEqual({ ok: true, paise: 99999999900 });
  });
});
