import { fireEvent, render, screen } from '@testing-library/react-native';

import { PopButton } from '@/ui/PopButton';
import { initTestI18n } from '../helpers/i18nTest';

beforeAll(() => initTestI18n());

test('shows its label and fires once per press', async () => {
  const onPress = jest.fn();
  await render(<PopButton label="Add spend" onPress={onPress} />);
  await fireEvent.press(screen.getByText('Add spend'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('does nothing when disabled', async () => {
  const onPress = jest.fn();
  await render(<PopButton label="Add spend" onPress={onPress} disabled />);
  await fireEvent.press(screen.getByText('Add spend'));
  expect(onPress).not.toHaveBeenCalled();
});

test('long translated labels may wrap to two lines instead of clipping', async () => {
  const label = 'செலவைச் சேர்க்கவும் மற்றும் உங்கள் பட்ஜெட்டைப் பாருங்கள்';
  await render(<PopButton label={label} onPress={() => {}} />);
  expect(screen.getByText(label).props.numberOfLines).toBeGreaterThanOrEqual(2);
});
