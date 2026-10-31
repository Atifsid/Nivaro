import { Redirect } from 'expo-router';

import { nextOnboardingStep, STEP_ROUTE } from '@/features/onboarding/nextStep';
import { useSettings } from '@/features/settings/SettingsProvider';

export default function Index() {
  const { settings } = useSettings();
  return <Redirect href={STEP_ROUTE[nextOnboardingStep(settings)]} />;
}
