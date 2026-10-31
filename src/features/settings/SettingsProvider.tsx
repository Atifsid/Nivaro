import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { useDb } from '@/db/DbProvider';
import { getSettings, updateSettings, type AppSettings } from '@/db/settings';
import { initI18n } from '@/i18n';
import { StartupError } from '@/ui/StartupError';

import { touchLastSeen } from './touchLastSeen';

type Ctx = { settings: AppSettings; update: (patch: Partial<AppSettings>) => Promise<void> };

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const db = useDb();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const latest = useRef<AppSettings | null>(null);
  latest.current = settings;

  const update = useCallback(
    async (patch: Partial<AppSettings>) => {
      await updateSettings(db, patch);
      setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    [db],
  );

  useEffect(() => {
    (async () => {
      try {
        const loaded = await getSettings(db);
        await initI18n(loaded.language);
        const touch = touchLastSeen(loaded, Date.now());
        if (touch) await updateSettings(db, touch);
        setSettings({ ...loaded, ...touch });
      } catch {
        setFailed(true);
      }
    })();
  }, [db, attempt]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !latest.current) return;
      const touch = touchLastSeen(latest.current, Date.now());
      if (touch) update(touch).catch(() => {});
    });
    return () => sub.remove();
  }, [update]);

  if (failed)
    return (
      <StartupError
        onRetry={() => {
          setFailed(false);
          setAttempt((a) => a + 1);
        }}
      />
    );
  if (!settings) return <>{fallback}</>;
  return <SettingsContext.Provider value={{ settings, update }}>{children}</SettingsContext.Provider>;
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
