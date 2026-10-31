import { cleanMerchant, merchantKey } from '@/capture/merchant';

test('cleans company suffixes, UPI handles and shouting', () => {
  expect(cleanMerchant('SWIGGY  PVT LTD')).toBe('Swiggy');
  expect(cleanMerchant('blinkit@ybl')).toBe('Blinkit');
  expect(cleanMerchant('Zomato Ltd')).toBe('Zomato');
  expect(cleanMerchant('AMAZON PAY INDIA PRIVATE LIMITED')).toBe('Amazon Pay');
});

test('the same shop written differently gets the same key', () => {
  expect(merchantKey('SWIGGY PVT LTD')).toBe(merchantKey('Swiggy'));
  expect(merchantKey('swiggy@okaxis')).toBe('swiggy');
});
