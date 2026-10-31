import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useDb } from '@/db/DbProvider';
import type { Lang } from '@/db/types';
import { useSettings } from '@/features/settings/SettingsProvider';
import { LANGUAGES, setLanguage } from '@/i18n';
import { colors, fontFor, space, type } from '@/theme/tokens';
import { Body, Title } from '@/ui/Label';
import { Screen } from '@/ui/Screen';

export default function LanguageStep() {
  const { t, i18n } = useTranslation();
  const db = useDb();
  const { update } = useSettings();

  const choose = async (code: Lang) => {
    await setLanguage(db, code);
    await update({ language: code });
    router.replace('/onboarding/budget');
  };

  return (
    <Screen>
      <Text style={[styles.brand, { fontFamily: fontFor('en', 'bold') }]}>nivaro</Text>
      <Title>{t('onboarding.language.title')}</Title>
      <Body muted>{t('onboarding.language.subtitle')}</Body>
      <View style={styles.list}>
        {LANGUAGES.map((l) => {
          const active = i18n.language === l.code;
          return (
            <Pressable
              key={l.code}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => choose(l.code)}
              style={({ pressed }) => [styles.row, active && styles.rowActive, pressed && styles.rowPressed]}>
              <Text style={[styles.name, { fontFamily: fontFor(l.code, 'bold') }]}>{l.nativeName}</Text>
              <Text style={[styles.arrow, { fontFamily: fontFor('en', 'bold') }]}>→</Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { ...type.title, color: colors.accent, marginTop: space.lg },
  list: { borderTopWidth: 1, borderTopColor: colors.hairline },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.lg,
    paddingHorizontal: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  rowActive: { backgroundColor: colors.surface },
  rowPressed: { backgroundColor: colors.surfaceRaised },
  name: { ...type.title, color: colors.text },
  arrow: { ...type.title, color: colors.accent },
});
