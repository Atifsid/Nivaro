import { tabBarHeight } from '@/ui/TabLabel';

test('never shorter than the base bar plus the system inset', () => {
  expect(tabBarHeight({ fontScale: 1, latin: true, insetBottom: 24 })).toBe(80 + 24);
});

test('grows for two lines of Indian script at large font sizes', () => {
  const h = tabBarHeight({ fontScale: 1.6, latin: false, insetBottom: 0 });
  expect(h).toBeGreaterThanOrEqual(48 + 2 * 18 * 1.4);
});

test('stops growing once text stops scaling', () => {
  expect(tabBarHeight({ fontScale: 3, latin: false, insetBottom: 0 })).toBe(
    tabBarHeight({ fontScale: 1.4, latin: false, insetBottom: 0 }),
  );
});
