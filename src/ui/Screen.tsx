import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, space } from '@/theme/tokens';

type Props = { children: ReactNode; footer?: ReactNode; scroll?: boolean; edges?: Edge[] };

export function Screen({ children, footer, scroll = true, edges = ['top', 'bottom'] }: Props) {
  const body = scroll ? (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fill]}>{children}</View>
  );
  return (
    <SafeAreaView style={styles.root} edges={edges}>
      {body}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  content: { padding: space.lg, gap: space.lg },
  footer: { paddingHorizontal: space.lg, paddingBottom: space.lg, paddingTop: space.sm },
});
