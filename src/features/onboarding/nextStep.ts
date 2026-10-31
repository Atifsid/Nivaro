import type { AppSettings } from '@/db/settings';

export type OnboardingStep = 'language' | 'budget' | 'start' | 'done';

export function nextOnboardingStep(s: AppSettings): OnboardingStep {
  if (s.onboardingDone) return 'done';
  if (!s.language) return 'language';
  if (!s.payday || !s.monthlyBudgetPaise) return 'budget';
  return 'start';
}

export const STEP_ROUTE = {
  language: '/onboarding/language',
  budget: '/onboarding/budget',
  start: '/onboarding/start',
  done: '/(tabs)',
} as const;
