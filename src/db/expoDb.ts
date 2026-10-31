import { openDatabaseAsync, type SQLiteBindValue } from 'expo-sqlite';

import type { Db } from './types';

export async function openExpoDb(name = 'nivaro.db'): Promise<Db> {
  const sqlite = await openDatabaseAsync(name);
  const bind = (params: unknown[] = []) => params as SQLiteBindValue[];
  return {
    exec: (sql) => sqlite.execAsync(sql),
    run: async (sql, params) => {
      await sqlite.runAsync(sql, bind(params));
    },
    all: (sql, params) => sqlite.getAllAsync(sql, bind(params)),
    first: (sql, params) => sqlite.getFirstAsync(sql, bind(params)),
  };
}
