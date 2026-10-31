import type { AppSettings } from '@/db/settings';
import { touchLastSeen } from '@/features/settings/touchLastSeen';

const D = 86_400_000;
const base: AppSettings = {
  language: 'en',
  payday: 1,
  monthlyBudgetPaise: 100,
  firstLaunchAt: 0,
  lastSeenAt: 0,
  onboardingDone: true,
  captureSeq: 0,
};

test('moves lastSeenAt forward when time has passed', () => {
  expect(touchLastSeen(base, 13 * D)).toEqual({ lastSeenAt: 13 * D });
});

test('never moves lastSeenAt backwards when the clock is set back', () => {
  expect(touchLastSeen({ ...base, lastSeenAt: 13 * D }, 1 * D)).toBeNull();
});

test('does nothing before the trial has started', () => {
  expect(touchLastSeen({ ...base, firstLaunchAt: null, lastSeenAt: null }, 5 * D)).toBeNull();
});
