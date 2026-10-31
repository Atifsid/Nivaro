import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useSettings } from '@/features/settings/SettingsProvider';
import { colors, space, type } from '@/theme/tokens';
import { Body, Title } from '@/ui/Label';
import { PopButton } from '@/ui/PopButton';
import { Screen } from '@/ui/Screen';

export default function StartStep() {
  const { t } = useTranslation();
  const { settings, update } = useSettings();

  const start = async () => {
    const now = Date.now();
    await update({
      firstLaunchAt: settings.firstLaunchAt ?? now,
      lastSeenAt: settings.lastSeenAt ?? now,
      onboardingDone: true,
    });
    router.replace('/(tabs)');
  };

  return (
    <Screen scroll={false} footer={<PopButton label={t('onboarding.start.cta')} onPress={start} />}>
      <View style={styles.center}>
        <View style={styles.badge}>
          <Title style={styles.badgeText}>PRO</Title>
        </View>
        <Title style={styles.title}>{t('onboarding.start.title')}</Title>
        <Body muted>{t('onboarding.start.subtitle')}</Body>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: space.md },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    marginBottom: space.md,
  },
  badgeText: { color: colors.onAccent, letterSpacing: 2 },
  title: { ...type.hero, fontSize: 34, lineHeight: 40 },
});
