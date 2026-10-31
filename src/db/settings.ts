import type { Db, Lang } from './types';

export type AppSettings = {
  language: Lang | null;
  payday: number | null;
  monthlyBudgetPaise: number | null;
  firstLaunchAt: number | null;
  lastSeenAt: number | null;
  onboardingDone: boolean;
};

const DEFAULTS: AppSettings = {
  language: null,
  payday: null,
  monthlyBudgetPaise: null,
  firstLaunchAt: null,
  lastSeenAt: null,
  onboardingDone: false,
};

export async function getSettings(db: Db): Promise<AppSettings> {
  const rows = await db.all<{ key: string; value: string }>('SELECT key, value FROM settings');
  const out: Record<string, unknown> = { ...DEFAULTS };
  for (const { key, value } of rows) {
    if (!(key in DEFAULTS)) continue;
    try {
      out[key] = JSON.parse(value);
    } catch {
      out[key] = DEFAULTS[key as keyof AppSettings];
    }
  }
  return out as AppSettings;
}

export async function updateSettings(db: Db, patch: Partial<AppSettings>): Promise<void> {
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    await db.run(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [key, JSON.stringify(value)],
    );
  }
}
