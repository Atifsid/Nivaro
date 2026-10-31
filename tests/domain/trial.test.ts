import { TRIAL_DAYS, trialStatus } from '@/domain/trial';

const D = 86_400_000;
const t0 = Date.UTC(2026, 9, 1);

describe('trialStatus', () => {
  test('is 15 days long', () => {
    expect(TRIAL_DAYS).toBe(15);
  });

  test('starts with all 15 days left', () => {
    expect(trialStatus(t0, t0, t0)).toMatchObject({ active: true, daysLeft: 15 });
  });

  test('half a day left still counts as one day', () => {
    expect(trialStatus(t0, t0, t0 + 14.5 * D)).toMatchObject({ active: true, daysLeft: 1 });
  });

  test('ends exactly after 15 days', () => {
    expect(trialStatus(t0, t0, t0 + 15 * D)).toMatchObject({ active: false, daysLeft: 0 });
  });

  test('moving the clock back does not give days back', () => {
    expect(trialStatus(t0, t0 + 12 * D, t0 + 2 * D)).toMatchObject({
      daysLeft: 3,
      effectiveNow: t0 + 12 * D,
    });
  });

  test('a clock set before first launch never shows more than 15 days', () => {
    expect(trialStatus(t0, t0, t0 - 30 * D).daysLeft).toBe(15);
  });
});
