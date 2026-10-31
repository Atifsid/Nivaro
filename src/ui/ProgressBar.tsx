import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/tokens';

type Props = { value: number; tone?: 'accent' | 'warning' | 'danger' };

const TONES = { accent: colors.accent, warning: colors.warning, danger: colors.danger };

export function ProgressBar({ value, tone = 'accent' }: Props) {
  const pct = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)) * 100;
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: TONES[tone] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, backgroundColor: colors.hairline, overflow: 'hidden' },
  fill: { height: '100%' },
});
