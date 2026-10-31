import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, space } from '@/theme/tokens';
import { useFont } from '@/theme/useFont';

const TABS = ['index', 'activity', 'budgets', 'bills', 'insights'] as const;
const LABEL_KEY = { index: 'tabs.home', activity: 'tabs.activity', budgets: 'tabs.budgets', bills: 'tabs.bills', insights: 'tabs.insights' };

export default function TabsLayout() {
  const { t } = useTranslation();
  const font = useFont('bold');
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: [styles.bar, { height: 80 + insets.bottom, paddingBottom: insets.bottom + space.xs }],
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarItemStyle: styles.item,
      }}>
      {TABS.map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: t(LABEL_KEY[name]),
            tabBarIcon: ({ focused }) => <View style={[styles.mark, focused && styles.markActive]} />,
            tabBarLabel: ({ focused }) => (
              <Text
                numberOfLines={2}
                style={[styles.label, { fontFamily: font, color: focused ? colors.text : colors.textMuted }]}>
                {t(LABEL_KEY[name])}
              </Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.bg,
    borderTopColor: colors.hairline,
    borderTopWidth: 1,
    paddingTop: space.sm,
  },
  item: { paddingHorizontal: 2 },
  mark: { width: 14, height: 4, backgroundColor: colors.hairline },
  markActive: { backgroundColor: colors.accent, width: 22 },
  label: { fontSize: 11, lineHeight: 15, textAlign: 'center', marginTop: space.xs },
});
