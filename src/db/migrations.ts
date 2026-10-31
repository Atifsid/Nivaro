import type { Db } from './types';

const V1 = `
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_key TEXT NOT NULL,
  icon TEXT NOT NULL,
  bucket TEXT NOT NULL CHECK (bucket IN ('needs','wants','savings','income')),
  sort INTEGER NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  direction TEXT NOT NULL CHECK (direction IN ('debit','credit')),
  merchant TEXT NOT NULL,
  note TEXT,
  category_id TEXT,
  instrument TEXT,
  source TEXT NOT NULL CHECK (source IN ('manual','sms','notification','shortcut')),
  occurred_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON transactions (occurred_at);
`;

const V2 = `
ALTER TABLE transactions ADD COLUMN ref TEXT;
ALTER TABLE transactions ADD COLUMN bank TEXT;
ALTER TABLE transactions ADD COLUMN merchant_key TEXT;
CREATE INDEX IF NOT EXISTS idx_transactions_amount_time ON transactions (amount_paise, occurred_at);
CREATE TABLE IF NOT EXISTS merchant_rules (
  merchant_key TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
`;

export async function migrate(db: Db): Promise<void> {
  const row = await db.first<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;
  if (version < 1) {
    await db.exec(V1);
    await db.exec('PRAGMA user_version = 1');
  }
  if (version < 2) {
    await db.exec(V2);
    await db.exec('PRAGMA user_version = 2');
  }
}
