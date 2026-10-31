import { validateTxForm } from '@/features/transactions/validate';

test('valid form gives paise and a trimmed merchant', () => {
  expect(validateTxForm({ amount: '₹ 1,250.50', merchant: '  Blinkit ' })).toEqual({
    ok: true,
    amountPaise: 125050,
    merchant: 'Blinkit',
  });
});

test('reports both amount and merchant problems at once', () => {
  expect(validateTxForm({ amount: '0', merchant: '   ' })).toEqual({
    ok: false,
    errors: { amount: 'errors.amount.zero', merchant: 'errors.merchant' },
  });
});

test('only the broken field gets an error', () => {
  expect(validateTxForm({ amount: 'abc', merchant: 'Swiggy' })).toEqual({
    ok: false,
    errors: { amount: 'errors.amount.invalid' },
  });
});
