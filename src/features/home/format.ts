import type { Category } from '@/db/categories';
import type { Transaction } from '@/db/transactions';

export function shortDate(ts: number, lang: string): string {
  try {
    return new Date(ts).toLocaleDateString(`${lang}-IN`, { day: 'numeric', month: 'short' });
  } catch {
    return new Date(ts).toDateString();
  }
}

export function txSubtitle(
  tx: Transaction,
  categories: Category[],
  t: (key: string) => string,
  lang: string,
): string {
  const cat = categories.find((c) => c.id === tx.categoryId);
  return `${cat ? t(cat.nameKey) : t('tx.noCategory')} · ${shortDate(tx.occurredAt, lang)}`;
}
