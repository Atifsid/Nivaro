import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFor, space, type } from '@/theme/tokens';

import { PopButton } from './PopButton';

export function StartupError({ onRetry }: { onRetry: () => void }) {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);
  return (
    <View style={styles.root}>
      <Text style={[styles.title, { fontFamily: fontFor('en', 'bold') }]}>Nivaro couldn't start</Text>
      <Text style={[styles.body, { fontFamily: fontFor('en', 'regular') }]}>
        Something went wrong opening your data on this phone. Your entries are safe. Please try again.
      </Text>
      <PopButton label="Try again" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: space.xl, gap: space.lg },
  title: { ...type.title, color: colors.text },
  body: { ...type.body, color: colors.textMuted },
});
