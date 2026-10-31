import type { AppSettings } from '@/db/settings';
import { nextOnboardingStep } from '@/features/onboarding/nextStep';

const fresh: AppSettings = {
  language: null,
  payday: null,
  monthlyBudgetPaise: null,
  firstLaunchAt: null,
  lastSeenAt: null,
  onboardingDone: false,
  captureSeq: 0,
};

test('a fresh install starts with language', () => {
  expect(nextOnboardingStep(fresh)).toBe('language');
});

test('after language comes payday and budget', () => {
  expect(nextOnboardingStep({ ...fresh, language: 'ta' })).toBe('budget');
});

test('payday without a budget stays on the budget step', () => {
  expect(nextOnboardingStep({ ...fresh, language: 'ta', payday: 25 })).toBe('budget');
});

test('budget without payday stays on the budget step', () => {
  expect(nextOnboardingStep({ ...fresh, language: 'ta', monthlyBudgetPaise: 3000000 })).toBe('budget');
});

test('with both set it asks to start the trial', () => {
  expect(nextOnboardingStep({ ...fresh, language: 'ta', payday: 25, monthlyBudgetPaise: 3000000 })).toBe('start');
});

test('finished onboarding goes home', () => {
  expect(
    nextOnboardingStep({ ...fresh, language: 'ta', payday: 25, monthlyBudgetPaise: 3000000, onboardingDone: true }),
  ).toBe('done');
});
