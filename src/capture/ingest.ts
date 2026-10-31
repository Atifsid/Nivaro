import { categoryForMerchant } from '@/db/merchants';
import { addTransaction, getTransaction, listTransactions, updateTransaction, type Transaction } from '@/db/transactions';
import type { Db } from '@/db/types';

import { merchantKey } from './merchant';
import { parseAlert } from './parse';
import type { ParsedAlert, RawAlert } from './types';

const WINDOW = 10 * 60_000;

export type IngestResult = { status: 'added' | 'merged' | 'ignored'; id?: string; needsCategory?: boolean };

export async function findDuplicate(db: Db, p: ParsedAlert): Promise<Transaction | null> {
  if (p.ref) {
    const byRef = await db.first<{ id: string }>('SELECT id FROM transactions WHERE ref = ? AND deleted_at IS NULL', [p.ref]);
    if (byRef) return getTransaction(db, byRef.id);
  }
  const near = await listTransactions(db, { from: p.occurredAt - WINDOW, to: p.occurredAt + WINDOW + 1 });
  return (
    near.find(
      (t) =>
        t.amountPaise === p.amountPaise &&
        t.direction === p.direction &&
        (!t.ref || !p.ref) &&
        (!t.instrument || !p.instrument || t.instrument === p.instrument),
    ) ?? null
  );
}

function betterMerchant(existing: Transaction, incoming: string | null): string | null {
  if (!incoming) return null;
  const inKey = merchantKey(incoming);
  if (!existing.merchantKey) return incoming;
  if (inKey && inKey !== existing.merchantKey && existing.merchantKey.startsWith(inKey)) return incoming;
  return null;
}

export async function ingestAlert(db: Db, raw: RawAlert, makeId?: () => string): Promise<IngestResult> {
  const p = parseAlert(raw);
  if (!p) return { status: 'ignored' };

  const dup = await findDuplicate(db, p);
  if (dup) {
    const merchant = betterMerchant(dup, p.merchant);
    await updateTransaction(db, dup.id, {
      merchant: merchant ?? undefined,
      merchantKey: merchant ? merchantKey(merchant) : undefined,
      instrument: dup.instrument ? undefined : p.instrument,
      bank: dup.bank ? undefined : p.bank,
      ref: dup.ref ? undefined : p.ref,
    });
    return { status: 'merged', id: dup.id };
  }

  const key = p.merchant ? merchantKey(p.merchant) : null;
  const categoryId = key ? await categoryForMerchant(db, key) : null;
  const id = await addTransaction(
    db,
    {
      amountPaise: p.amountPaise,
      direction: p.direction,
      merchant: p.merchant ?? p.bank ?? 'Unknown',
      merchantKey: key,
      categoryId,
      instrument: p.instrument,
      bank: p.bank,
      ref: p.ref,
      source: raw.source,
      occurredAt: p.occurredAt,
    },
    makeId,
  );
  return { status: 'added', id, needsCategory: p.direction === 'debit' && !categoryId };
}
