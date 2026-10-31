export type CaptureSource = 'notifications' | 'sms' | 'shortcut';

export type CaptureInput = {
  platform: 'android' | 'ios';
  notificationAccess: boolean;
  smsSupported: boolean;
  smsGranted: boolean;
  shortcutConfigured: boolean;
};

export function captureStatus(i: CaptureInput): { state: 'on' | 'partial' | 'off'; missing: CaptureSource[] } {
  if (i.platform === 'ios') {
    return i.shortcutConfigured ? { state: 'on', missing: [] } : { state: 'off', missing: ['shortcut'] };
  }
  const missing: CaptureSource[] = [];
  if (!i.notificationAccess) missing.push('notifications');
  if (i.smsSupported && !i.smsGranted) missing.push('sms');
  if (!i.notificationAccess) return { state: 'off', missing };
  return { state: missing.length ? 'partial' : 'on', missing };
}
