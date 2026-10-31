import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { listCategories, type Category } from '@/db/categories';
import { useDb } from '@/db/DbProvider';
import { listTransactions, type Transaction } from '@/db/transactions';
import { shortDate, txSubtitle } from '@/features/home/format';
import { space } from '@/theme/tokens';
import { Body, Label, Title } from '@/ui/Label';
import { Screen } from '@/ui/Screen';
import { TxRow } from '@/ui/TxRow';

type Group = { key: string; title: string; items: Transaction[] };

export default function Activity() {
  const { t, i18n } = useTranslation();
  const db = useDb();
  const [rows, setRows] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useFocusEffect(
    useCallback(() => {
      let live = true;
      Promise.all([listTransactions(db, { uncategorisedFirst: true }), listCategories(db)]).then(([r, c]) => {
        if (!live) return;
        setRows(r);
        setCategories(c);
      });
      return () => {
        live = false;
      };
    }, [db]),
  );

  const groups: Group[] = [];
  const pending = rows.filter((r) => !r.categoryId);
  if (pending.length) groups.push({ key: 'pending', title: t('activity.uncategorised'), items: pending });
  for (const r of rows.filter((x) => x.categoryId)) {
    const title = shortDate(r.occurredAt, i18n.language);
    const last = groups[groups.length - 1];
    if (last && last.key !== 'pending' && last.title === title) last.items.push(r);
    else groups.push({ key: `${title}-${r.id}`, title, items: [r] });
  }

  return (
    <Screen edges={['top']}>
      <Title>{t('activity.title')}</Title>
      {groups.length === 0 ? <Body muted>{t('activity.empty')}</Body> : null}
      {groups.map((g) => (
        <View key={g.key} style={styles.group}>
          <Label>{g.title}</Label>
          {g.items.map((tx) => (
            <TxRow
              key={tx.id}
              tx={tx}
              subtitle={txSubtitle(tx, categories, t, i18n.language)}
              onPress={() => router.push({ pathname: '/transaction/edit', params: { id: tx.id } })}
            />
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: space.xs },
});
