import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { listCategories, type Category } from '@/db/categories';
import { useDb } from '@/db/DbProvider';
import { getTransaction, updateTransaction, type Transaction } from '@/db/transactions';
import { colors, space, type } from '@/theme/tokens';
import { useFont } from '@/theme/useFont';
import { Body, Title } from '@/ui/Label';
import { Money } from '@/ui/Money';
import { PopButton } from '@/ui/PopButton';
import { Screen } from '@/ui/Screen';
import { useSubmitGuard } from '@/ui/useSubmitGuard';

export default function Categorise() {
  const { t } = useTranslation();
  const font = useFont('bold');
  const db = useDb();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { run, busy } = useSubmitGuard();

  useEffect(() => {
    if (!id) return;
    getTransaction(db, id).then(setTx);
    listCategories(db).then(setCategories);
  }, [db, id]);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  const choose = (categoryId: string) =>
    run(async () => {
      if (!tx) return;
      await updateTransaction(db, tx.id, { categoryId });
      close();
    });

  if (!tx) return <Screen>{null}</Screen>;

  const shown = categories.filter((c) => (tx.direction === 'credit' ? c.bucket === 'income' : c.bucket !== 'income'));

  return (
    <Screen footer={<PopButton label={t('prompt.skip')} variant="secondary" onPress={close} disabled={busy} />}>
      <View style={styles.head}>
        <Money paise={tx.amountPaise} size="hero" />
        <Title>{tx.merchant}</Title>
        <Body muted>{t('prompt.body')}</Body>
      </View>
      <View style={styles.chips}>
        {shown.map((c) => (
          <Pressable
            key={c.id}
            accessibilityRole="button"
            disabled={busy}
            onPress={() => choose(c.id)}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
            <Text style={[styles.chipText, { fontFamily: font }]}>
              {c.icon} {t(c.nameKey)}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: space.xs, marginTop: space.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { borderWidth: 1, borderColor: colors.hairline, paddingHorizontal: space.md, paddingVertical: space.md },
  chipPressed: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { ...type.body, color: colors.text },
});
