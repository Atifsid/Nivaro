import { captureStatus } from '@/features/capture/status';

test('Android with notifications and SMS allowed is fully on', () => {
  expect(
    captureStatus({ platform: 'android', notificationAccess: true, smsSupported: true, smsGranted: true, shortcutConfigured: false }),
  ).toEqual({ state: 'on', missing: [] });
});

test('Android without notification access is off', () => {
  expect(
    captureStatus({ platform: 'android', notificationAccess: false, smsSupported: true, smsGranted: true, shortcutConfigured: false }),
  ).toEqual({ state: 'off', missing: ['notifications'] });
});

test('Android with notifications but no SMS is partly on', () => {
  expect(
    captureStatus({ platform: 'android', notificationAccess: true, smsSupported: true, smsGranted: false, shortcutConfigured: false }),
  ).toEqual({ state: 'partial', missing: ['sms'] });
});

test('a build without SMS does not count SMS as missing', () => {
  expect(
    captureStatus({ platform: 'android', notificationAccess: true, smsSupported: false, smsGranted: false, shortcutConfigured: false }),
  ).toEqual({ state: 'on', missing: [] });
});

test('iPhone depends only on the Shortcuts automation', () => {
  const base = { platform: 'ios' as const, notificationAccess: false, smsSupported: false, smsGranted: false };
  expect(captureStatus({ ...base, shortcutConfigured: true })).toEqual({ state: 'on', missing: [] });
  expect(captureStatus({ ...base, shortcutConfigured: false })).toEqual({ state: 'off', missing: ['shortcut'] });
});
