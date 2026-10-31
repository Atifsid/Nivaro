import type { AppSettings } from '@/db/settings';

export function touchLastSeen(s: AppSettings, now: number): Pick<AppSettings, 'lastSeenAt'> | null {
  if (s.firstLaunchAt === null) return null;
  if (s.lastSeenAt !== null && now <= s.lastSeenAt) return null;
  return { lastSeenAt: now };
}
