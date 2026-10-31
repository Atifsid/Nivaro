import type { Category } from '@/db/categories';
import type { Transaction } from '@/db/transactions';
import { formatINR } from '@/domain/money';

type T = (key: string, opts?: Record<string, string>) => string;

export type PromptContent = { title: string; body: string; actions: { id: string; label: string }[] };

export function promptContent(tx: Transaction, suggestions: Category[], t: T): PromptContent {
  return {
    title: t('prompt.title', { amount: formatINR(tx.amountPaise), merchant: tx.merchant }),
    body: t('prompt.body'),
    actions: [
      ...suggestions.slice(0, 3).map((c) => ({ id: c.id, label: t(c.nameKey) })),
      { id: 'skip', label: t('prompt.skip') },
    ],
  };
}
