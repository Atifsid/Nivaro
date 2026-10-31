import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { colors, space } from '@/theme/tokens';

import { Body, Label, Title } from './Label';
import { Screen } from './Screen';
import { Surface } from './Surface';

export function ComingSoon({ titleKey, bodyKey }: { titleKey: string; bodyKey: string }) {
  const { t } = useTranslation();
  return (
    <Screen edges={['top']}>
      <Title>{t(titleKey)}</Title>
      <Surface style={styles.card}>
        <Label style={styles.tag}>{t('common.comingSoon')}</Label>
        <Body muted>{t(bodyKey)}</Body>
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.sm, borderStyle: 'dashed' },
  tag: { color: colors.accent },
});
