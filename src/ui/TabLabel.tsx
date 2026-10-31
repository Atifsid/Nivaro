import { StyleSheet, Text } from 'react-native';

import { colors, space } from '@/theme/tokens';
import { useFont, useIsLatin } from '@/theme/useFont';

export const TAB_MAX_FONT_SCALE = 1.4;

export function tabLineHeight(latin: boolean): number {
  return latin ? 14 : 18;
}

export function tabBarHeight({ fontScale, latin, insetBottom }: { fontScale: number; latin: boolean; insetBottom: number }) {
  const scale = Math.min(Math.max(fontScale, 1), TAB_MAX_FONT_SCALE);
  return Math.max(80, Math.ceil(48 + 2 * tabLineHeight(latin) * scale)) + insetBottom;
}

export function TabLabel({ text, focused }: { text: string; focused: boolean }) {
  const font = useFont('bold');
  const latin = useIsLatin();
  return (
    <Text
      numberOfLines={2}
      adjustsFontSizeToFit
      minimumFontScale={0.8}
      maxFontSizeMultiplier={TAB_MAX_FONT_SCALE}
      style={[
        styles.label,
        { fontFamily: font, lineHeight: tabLineHeight(latin), color: focused ? colors.text : colors.textMuted },
      ]}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, textAlign: 'center', marginTop: space.xs },
});
