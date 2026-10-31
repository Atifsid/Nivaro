import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useDb } from '@/db/DbProvider';
import type { Lang } from '@/db/types';
import { trialStatus, type TrialStatus } from '@/domain/trial';
import { useSettings } from '@/features/settings/SettingsProvider';
import { LANGUAGES, setLanguage } from '@/i18n';
import { colors, fontFor, space, type } from '@/theme/tokens';
import { Body, Label, Title } from '@/ui/Label';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';

export default function Me() {
  const { t, i18n } = useTranslation();
  const db = useDb();
  const { settings, update } = useSettings();
  const [trial, setTrial] = useState<TrialStatus | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (settings.firstLaunchAt === null) return;
      const status = trialStatus(settings.firstLaunchAt, settings.lastSeenAt ?? settings.firstLaunchAt, Date.now());
      setTrial(status);
      if (status.effectiveNow !== settings.lastSeenAt) update({ lastSeenAt: status.effectiveNow });
    }, [settings.firstLaunchAt, settings.lastSeenAt, update]),
  );

  const choose = async (code: Lang) => {
    await setLanguage(db, code);
    await update({ language: code });
  };

  return (
    <Screen>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('common.cancel')} onPress={() => router.back()} hitSlop={12}>
          <Text style={[styles.back, { fontFamily: fontFor('en', 'bold') }]}>←</Text>
        </Pressable>
        <Title>{t('me.title')}</Title>
      </View>

      {trial ? (
        <Surface style={[styles.trial, trial.active ? styles.trialOn : null]}>
          <Body style={trial.active ? styles.trialOnText : undefined}>
            {trial.active ? t('me.trialActive', { count: trial.daysLeft }) : t('me.trialEnded')}
          </Body>
        </Surface>
      ) : null}

      <View style={styles.section}>
        <Label>{t('me.language')}</Label>
        <View style={styles.langs}>
          {LANGUAGES.map((l) => {
            const active = i18n.language === l.code;
            return (
              <Pressable
                key={l.code}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => choose(l.code)}
                style={[styles.lang, active && styles.langActive]}>
                <Text style={[styles.langText, { fontFamily: fontFor(l.code, 'bold') }, active && styles.langTextActive]}>
                  {l.nativeName}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Body muted style={styles.version}>
        {t('me.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
      </Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  back: { ...type.title, color: colors.textMuted },
  trial: { borderColor: colors.hairline },
  trialOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  trialOnText: { color: colors.onAccent },
  section: { gap: space.sm },
  langs: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  lang: { borderWidth: 1, borderColor: colors.hairline, paddingHorizontal: space.md, paddingVertical: space.sm },
  langActive: { backgroundColor: colors.text, borderColor: colors.text },
  langText: { ...type.body, color: colors.text },
  langTextActive: { color: colors.bg },
  version: { fontSize: 12, marginTop: space.xl },
});
