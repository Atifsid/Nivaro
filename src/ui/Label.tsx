import { Text, type TextProps } from 'react-native';

import { colors, type } from '@/theme/tokens';
import { useFont, useIsLatin } from '@/theme/useFont';

export function Label({ style, ...rest }: TextProps) {
  const font = useFont('bold');
  const latin = useIsLatin();
  return (
    <Text
      style={[
        type.label,
        { color: colors.textMuted, fontFamily: font },
        latin ? { textTransform: 'uppercase' } : { letterSpacing: 0, fontSize: 12, lineHeight: 18 },
        style,
      ]}
      {...rest}
    />
  );
}

export function Body({ style, muted, ...rest }: TextProps & { muted?: boolean }) {
  const font = useFont('regular');
  return <Text style={[type.body, { color: muted ? colors.textMuted : colors.text, fontFamily: font }, style]} {...rest} />;
}

export function Title({ style, ...rest }: TextProps) {
  const font = useFont('bold');
  return <Text style={[type.title, { color: colors.text, fontFamily: font }, style]} {...rest} />;
}
