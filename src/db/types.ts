export interface Db {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: unknown[]): Promise<void>;
  all<T>(sql: string, params?: unknown[]): Promise<T[]>;
  first<T>(sql: string, params?: unknown[]): Promise<T | null>;
}

export type Lang = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'mr' | 'bn' | 'gu';
