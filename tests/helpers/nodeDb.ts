import Database from 'better-sqlite3';

import type { Db } from '@/db/types';

export function nodeDb(): Db {
  const sqlite = new Database(':memory:');
  return {
    exec: async (sql) => {
      sqlite.exec(sql);
    },
    run: async (sql, params = []) => {
      sqlite.prepare(sql).run(...(params as unknown[]));
    },
    all: async <T,>(sql: string, params: unknown[] = []) => sqlite.prepare(sql).all(...params) as T[],
    first: async <T,>(sql: string, params: unknown[] = []) =>
      (sqlite.prepare(sql).get(...params) as T | undefined) ?? null,
  };
}

export function counterIds(): () => string {
  let n = 0;
  return () => `id-${++n}`;
}
