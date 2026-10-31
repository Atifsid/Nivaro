import { homeSummary } from '@/features/home/homeSummary';

const now = new Date(2026, 9, 12, 10);

test('shows what is left and how much of the budget is used', () => {
  expect(homeSummary({ now, payday: 1, budgetPaise: 3_000_000, spentPaise: 1_140_000 })).toEqual({
    leftPaise: 1_860_000,
    spentRatio: 0.38,
    overBy: 0,
    dayIndex: 12,
    length: 31,
  });
});

test('overspending shows zero left and how far over', () => {
  expect(homeSummary({ now, payday: 1, budgetPaise: 3_000_000, spentPaise: 3_200_000 })).toMatchObject({
    leftPaise: 0,
    overBy: 200_000,
    spentRatio: 1,
  });
});

test('nothing spent yet means the full budget is left', () => {
  expect(homeSummary({ now, payday: 1, budgetPaise: 3_000_000, spentPaise: 0 })).toMatchObject({
    leftPaise: 3_000_000,
    spentRatio: 0,
  });
});
