import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { TabLabel } from '@/ui/TabLabel';
import { initTestI18n } from '../helpers/i18nTest';

afterAll(() => initTestI18n('en'));

test('Indian script tab labels get room for stacked vowel signs and large fonts', async () => {
  await initTestI18n('ml');
  await render(<TabLabel text="പ്രവർത്തനങ്ങൾ" focused={false} />);
  const node = screen.getByText('പ്രവർത്തനങ്ങൾ');
  expect(StyleSheet.flatten(node.props.style).lineHeight).toBeGreaterThanOrEqual(18);
  expect(node.props.numberOfLines).toBe(2);
  expect(node.props.maxFontSizeMultiplier).toBeLessThanOrEqual(1.4);
  expect(node.props.adjustsFontSizeToFit).toBe(true);
});
