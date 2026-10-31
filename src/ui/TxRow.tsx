import { Pressable, StyleSheet, View } from 'react-native';

import type { Transaction } from '@/db/transactions';
import { colors, space } from '@/theme/tokens';

import { Body } from './Label';
import { Money } from './Money';

type Props = { tx: Transaction; subtitle: string; onPress: () => void };

export function TxRow({ tx, subtitle, onPress }: Props) {
  const debit = tx.direction === 'debit';
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.row}>
      <View style={styles.text}>
        <Body numberOfLines={1}>{tx.merchant}</Body>
        <Body muted numberOfLines={1} style={styles.sub}>
          {subtitle}
        </Body>
      </View>
      <Money paise={debit ? -tx.amountPaise : tx.amountPaise} sign color={debit ? colors.text : colors.positive} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: space.md,
  },
  text: { flex: 1 },
  sub: { fontSize: 12, marginTop: 2 },
});
