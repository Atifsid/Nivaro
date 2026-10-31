import { Text, type TextProps } from 'react-native';

import { colors, type } from '@/theme/tokens';
import { useFont } from '@/theme/useFont';

export function Label({ style, ...rest }: TextProps) {
  const font = useFont('bold');
  return (
    <Text
      style={[type.label, { color: colors.textMuted, fontFamily: font, textTransform: 'uppercase' }, style]}
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
