import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, space } from '@/theme/tokens';

export function Surface({ style, ...rest }: ViewProps) {
  return <View style={[styles.surface, style]} {...rest} />;
}

const styles = StyleSheet.create({
  surface: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairline, padding: space.lg },
});
