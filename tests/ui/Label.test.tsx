import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Label } from '@/ui/Label';
import { initTestI18n } from '../helpers/i18nTest';

afterAll(() => initTestI18n('en'));

test('English labels are spaced out and uppercase', async () => {
  await initTestI18n('en');
  await render(<Label>Day you get paid</Label>);
  const style = StyleSheet.flatten(screen.getByText('Day you get paid').props.style);
  expect(style.letterSpacing).toBeGreaterThan(0);
  expect(style.textTransform).toBe('uppercase');
});

test('Indian script labels keep letters joined', async () => {
  await initTestI18n('ta');
  await render(<Label>சம்பளம் வரும் நாள்</Label>);
  const style = StyleSheet.flatten(screen.getByText('சம்பளம் வரும் நாள்').props.style);
  expect(style.letterSpacing ?? 0).toBe(0);
  expect(style.textTransform ?? 'none').toBe('none');
});
