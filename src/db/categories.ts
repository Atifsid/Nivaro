import type { Db } from './types';

export type Bucket = 'needs' | 'wants' | 'savings' | 'income';

export type Category = { id: string; nameKey: string; icon: string; bucket: Bucket; sort: number };

export const DEFAULT_CATEGORIES: [id: string, icon: string, bucket: Bucket][] = [
  ['groceries', '🛒', 'needs'],
  ['food_delivery', '🛵', 'needs'],
  ['dining', '🍽️', 'needs'],
  ['fuel', '⛽', 'needs'],
  ['transport', '🚇', 'needs'],
  ['rent', '🏠', 'needs'],
  ['emi', '🏦', 'needs'],
  ['utilities', '💡', 'needs'],
  ['mobile_internet', '📶', 'needs'],
  ['health', '💊', 'needs'],
  ['education', '🎓', 'needs'],
  ['insurance', '🛡️', 'needs'],
  ['shopping', '🛍️', 'wants'],
  ['entertainment', '🎬', 'wants'],
  ['subscriptions', '🔁', 'wants'],
  ['travel', '✈️', 'wants'],
  ['personal_care', '💇', 'wants'],
  ['gifts', '🎁', 'wants'],
  ['savings_investments', '📈', 'savings'],
  ['salary', '💼', 'income'],
  ['other_income', '💰', 'income'],
  ['other', '•', 'wants'],
];

export async function seedDefaultCategories(db: Db): Promise<void> {
  for (const [i, [id, icon, bucket]] of DEFAULT_CATEGORIES.entries()) {
    await db.run(
      'INSERT OR IGNORE INTO categories (id, name_key, icon, bucket, sort) VALUES (?, ?, ?, ?, ?)',
      [id, `category.${id}`, icon, bucket, i],
    );
  }
}

export async function listCategories(db: Db): Promise<Category[]> {
  return db.all<Category>(
    'SELECT id, name_key AS nameKey, icon, bucket, sort FROM categories WHERE archived = 0 ORDER BY sort',
  );
}
