import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { seedDefaultCategories } from './categories';
import { openExpoDb } from './expoDb';
import { migrate } from './migrations';
import type { Db } from './types';

const DbContext = createContext<Db | null>(null);

export function DbProvider({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [db, setDb] = useState<Db | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const opened = await openExpoDb();
      await migrate(opened);
      await seedDefaultCategories(opened);
      if (!cancelled) setDb(opened);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!db) return <>{fallback}</>;
  return <DbContext.Provider value={db}>{children}</DbContext.Provider>;
}

export function useDb(): Db {
  const db = useContext(DbContext);
  if (!db) throw new Error('useDb must be used inside DbProvider');
  return db;
}
