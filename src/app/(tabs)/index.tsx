import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { listCategories, type Category } from '@/db/categories';
import { useDb } from '@/db/DbProvider';
import { cycleSpendPaise, listTransactions, type Transaction } from '@/db/transactions';
import { getCycle } from '@/domain/cycle';
import { formatINR } from '@/domain/money';
import { txSubtitle } from '@/features/home/format';
import { homeSummary } from '@/features/home/homeSummary';
import { useSettings } from '@/features/settings/SettingsProvider';
import { colors, fontFor, space, type } from '@/theme/tokens';
import { Body, Label } from '@/ui/Label';
import { Money } from '@/ui/Money';
import { PopButton } from '@/ui/PopButton';
import { ProgressBar } from '@/ui/ProgressBar';
import { Screen } from '@/ui/Screen';
import { Surface } from '@/ui/Surface';
import { TxRow } from '@/ui/TxRow';

export default function Home() {
  const { t, i18n } = useTranslation();
  const db = useDb();
  const { settings } = useSettings();
  const payday = settings.payday ?? 1;
  const budget = settings.monthlyBudgetPaise ?? 0;

  const [spent, setSpent] = useState(0);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [uncategorised, setUncategorised] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  useFocusEffect(
    useCallback(() => {
      let live = true;
      (async () => {
        const cycle = getCycle(new Date(), payday);
        const [s, r, all, cats] = await Promise.all([
          cycleSpendPaise(db, cycle.start.getTime(), cycle.end.getTime()),
          listTransactions(db, { limit: 5 }),
          listTransactions(db, { from: cycle.start.getTime(), to: cycle.end.getTime() }),
          listCategories(db),
        ]);
        if (!live) return;
        setSpent(s);
        setRecent(r);
        setUncategorised(all.filter((x) => !x.categoryId && x.direction === 'debit').length);
        setCategories(cats);
      })();
      return () => {
        live = false;
      };
    }, [db, payday]),
  );

  const sum = homeSummary({ now: new Date(), payday, budgetPaise: budget, spentPaise: spent });
  const tone = sum.overBy > 0 ? 'danger' : sum.spentRatio >= 0.8 ? 'warning' : 'accent';

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.brand, { fontFamily: fontFor('en', 'bold') }]}>nivaro</Text>
        <View style={styles.headerRight}>
          <Label>{t('home.day', { day: sum.dayIndex, length: sum.length })}</Label>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('me.title')}
            onPress={() => router.push('/me')}
            hitSlop={12}
            style={styles.me}>
            <Text style={[styles.meText, { fontFamily: fontFor('en', 'bold') }]}>◐</Text>
          </Pressable>
        </View>
      </View>

      <Surface style={styles.hero}>
        <Label>{t('home.left')}</Label>
        <Money paise={sum.leftPaise} size="hero" color={sum.overBy > 0 ? colors.danger : colors.text} />
        <Body muted style={styles.small}>
          {sum.overBy > 0
            ? t('home.over', { amount: formatINR(sum.overBy) })
            : t('home.leftOf', { left: formatINR(sum.leftPaise), total: formatINR(budget) })}
        </Body>
        <ProgressBar value={sum.spentRatio} tone={tone} />
        <View style={styles.cta}>
          <PopButton label={t('home.addSpend')} onPress={() => router.push('/transaction/edit')} />
        </View>
      </Surface>

      {uncategorised > 0 ? (
        <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/activity')} style={styles.notice}>
          <Body style={styles.noticeText}>{t('home.toCategorise', { count: uncategorised })}</Body>
          <Body style={styles.noticeText}>→</Body>
        </Pressable>
      ) : null}

      <View>
        <Label style={styles.sectionLabel}>{t('home.recent')}</Label>
        {recent.length === 0 ? (
          <Body muted>{t('home.empty')}</Body>
        ) : (
          recent.map((tx) => (
            <TxRow
              key={tx.id}
              tx={tx}
              subtitle={txSubtitle(tx, categories, t, i18n.language)}
              onPress={() => router.push({ pathname: '/transaction/edit', params: { id: tx.id } })}
            />
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  brand: { ...type.title, color: colors.text },
  me: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meText: { color: colors.accent, fontSize: 18 },
  hero: { gap: space.sm },
  small: { fontSize: 13 },
  cta: { marginTop: space.md },
  notice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.warning,
    padding: space.md,
  },
  noticeText: { color: colors.warning },
  sectionLabel: { marginBottom: space.xs },
});
