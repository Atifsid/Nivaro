import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { useDb } from '@/db/DbProvider';
import { getSettings, updateSettings, type AppSettings } from '@/db/settings';
import { initI18n } from '@/i18n';

type Ctx = { settings: AppSettings; update: (patch: Partial<AppSettings>) => Promise<void> };

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const db = useDb();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    (async () => {
      const loaded = await getSettings(db);
      await initI18n(loaded.language);
      setSettings(loaded);
    })();
  }, [db]);

  const update = useCallback(
    async (patch: Partial<AppSettings>) => {
      await updateSettings(db, patch);
      setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    [db],
  );

  if (!settings) return <>{fallback}</>;
  return <SettingsContext.Provider value={{ settings, update }}>{children}</SettingsContext.Provider>;
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
