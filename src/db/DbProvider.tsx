import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { StartupError } from '@/ui/StartupError';

import { seedDefaultCategories } from './categories';
import { openExpoDb } from './expoDb';
import { migrate } from './migrations';
import type { Db } from './types';

const DbContext = createContext<Db | null>(null);

export function DbProvider({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [db, setDb] = useState<Db | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const opened = await openExpoDb();
        await migrate(opened);
        await seedDefaultCategories(opened);
        if (!cancelled) setDb(opened);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (failed)
    return (
      <StartupError
        onRetry={() => {
          setFailed(false);
          setAttempt((a) => a + 1);
        }}
      />
    );
  if (!db) return <>{fallback}</>;
  return <DbContext.Provider value={db}>{children}</DbContext.Provider>;
}

export function useDb(): Db {
  const db = useContext(DbContext);
  if (!db) throw new Error('useDb must be used inside DbProvider');
  return db;
}
