import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { parseAmountToPaise } from '@/domain/money';
import { useSettings } from '@/features/settings/SettingsProvider';
import { colors, space, type } from '@/theme/tokens';
import { useNumberFont } from '@/theme/useFont';
import { Field } from '@/ui/Field';
import { Body, Label, Title } from '@/ui/Label';
import { PopButton } from '@/ui/PopButton';
import { Screen } from '@/ui/Screen';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const WEEKS = Array.from({ length: 5 }, (_, w) => DAYS.slice(w * 7, w * 7 + 7));

export default function BudgetStep() {
  const { t } = useTranslation();
  const numberFont = useNumberFont();
  const { settings, update } = useSettings();
  const [payday, setPayday] = useState<number>(settings.payday ?? 1);
  const [amount, setAmount] = useState(settings.monthlyBudgetPaise ? String(settings.monthlyBudgetPaise / 100) : '');
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const parsed = parseAmountToPaise(amount);
    if (!parsed.ok) {
      setError(t(`errors.amount.${parsed.error}`));
      return;
    }
    await update({ payday, monthlyBudgetPaise: parsed.paise });
    router.replace('/onboarding/start');
  };

  return (
    <Screen footer={<PopButton label={t('common.continue')} onPress={save} />}>
      <Title style={styles.title}>{t('onboarding.budget.title')}</Title>
      <View style={styles.section}>
        <Label>{t('onboarding.budget.paydayLabel')}</Label>
        <View style={styles.grid}>
          {WEEKS.map((week, wi) => (
            <View key={wi} style={styles.week}>
              {week.map((d) => {
                const active = d === payday;
                return (
                  <Pressable
                    key={d}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${t('onboarding.budget.paydayLabel')} ${d}`}
                    onPress={() => setPayday(d)}
                    style={[styles.day, active && styles.dayActive]}>
                    <Text style={[styles.dayText, { fontFamily: numberFont }, active && styles.dayTextActive]}>
                      {d}
                    </Text>
                  </Pressable>
                );
              })}
              {Array.from({ length: 7 - week.length }, (_, i) => (
                <View key={`f${i}`} style={styles.filler} />
              ))}
            </View>
          ))}
        </View>
        <Body muted style={styles.hint}>
          {t('onboarding.budget.paydayHint')}
        </Body>
      </View>
      <Field
        label={t('onboarding.budget.budgetLabel')}
        hint={t('onboarding.budget.budgetHint')}
        error={error}
        prefix="₹"
        numeric
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={(v) => {
          setAmount(v);
          setError(null);
        }}
        placeholder="30,000"
        returnKeyType="done"
        onSubmitEditing={save}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: space.lg },
  section: { gap: space.sm },
  grid: { gap: space.xs },
  week: { flexDirection: 'row', gap: space.xs },
  filler: { flex: 1, borderWidth: 1, borderColor: 'transparent' },
  day: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  dayActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  dayText: { ...type.body, color: colors.text },
  dayTextActive: { color: colors.onAccent },
  hint: { fontSize: 12 },
});
