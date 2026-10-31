export const TRIAL_DAYS = 15;

const DAY = 86_400_000;

export type TrialStatus = { active: boolean; daysLeft: number; effectiveNow: number };

export function trialStatus(firstLaunchAt: number, lastSeenAt: number, now: number): TrialStatus {
  const effectiveNow = Math.max(now, lastSeenAt);
  const remaining = firstLaunchAt + TRIAL_DAYS * DAY - effectiveNow;
  const daysLeft = Math.min(TRIAL_DAYS, Math.max(0, Math.ceil(remaining / DAY)));
  return { active: daysLeft > 0, daysLeft, effectiveNow };
}
