import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DbProvider } from '@/db/DbProvider';
import { SettingsProvider } from '@/features/settings/SettingsProvider';
import { FONT_MAP } from '@/theme/fonts';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Ready({ children }: { children: ReactNode }) {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);
  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FONT_MAP);
  if (!fontsLoaded && !fontError) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <DbProvider>
        <SettingsProvider>
          <Ready>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
          </Ready>
        </SettingsProvider>
      </DbProvider>
    </SafeAreaProvider>
  );
}
