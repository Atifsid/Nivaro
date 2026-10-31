import type { Db } from './types';

export async function rememberMerchant(db: Db, key: string, categoryId: string): Promise<void> {
  await db.run(
    `INSERT INTO merchant_rules (merchant_key, category_id, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(merchant_key) DO UPDATE SET category_id = excluded.category_id, updated_at = excluded.updated_at`,
    [key, categoryId, Date.now()],
  );
}

export async function categoryForMerchant(db: Db, key: string): Promise<string | null> {
  const row = await db.first<{ category_id: string }>('SELECT category_id FROM merchant_rules WHERE merchant_key = ?', [key]);
  return row?.category_id ?? null;
}
