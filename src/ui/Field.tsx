import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, space, type } from '@/theme/tokens';
import { useFont, useNumberFont } from '@/theme/useFont';

import { Label } from './Label';

type Props = TextInputProps & { label: string; hint?: string; error?: string | null; prefix?: string; numeric?: boolean };

export function Field({ label, hint, error, prefix, numeric, style, ...input }: Props) {
  const font = useFont('regular');
  const numberFont = useNumberFont();
  return (
    <View style={styles.wrap}>
      <Label>{label}</Label>
      <View style={[styles.box, error ? styles.boxError : null]}>
        {prefix ? <Text style={[styles.prefix, { fontFamily: numberFont }]}>{prefix}</Text> : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          style={[styles.input, { fontFamily: numeric ? numberFont : font }, style]}
          accessibilityLabel={label}
          {...input}
        />
      </View>
      {error ? (
        <Text style={[styles.error, { fontFamily: font }]} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={[styles.hint, { fontFamily: font }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
  },
  boxError: { borderColor: colors.danger },
  prefix: { ...type.title, color: colors.textMuted, marginRight: space.sm },
  input: { flex: 1, ...type.title, color: colors.text, paddingVertical: space.md },
  hint: { ...type.small, color: colors.textMuted },
  error: { ...type.small, color: colors.danger },
});
