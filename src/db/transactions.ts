import { randomUUID } from 'expo-crypto';

import type { Db } from './types';

export type Direction = 'debit' | 'credit';
export type Source = 'manual' | 'sms' | 'notification' | 'shortcut';

export type NewTransaction = {
  amountPaise: number;
  direction: Direction;
  merchant: string;
  note?: string | null;
  categoryId?: string | null;
  instrument?: string | null;
  source: Source;
  occurredAt: number;
};

export type Transaction = Required<NewTransaction> & { id: string; createdAt: number; updatedAt: number };

const SELECT = `SELECT id, amount_paise AS amountPaise, direction, merchant, note, category_id AS categoryId,
  instrument, source, occurred_at AS occurredAt, created_at AS createdAt, updated_at AS updatedAt
  FROM transactions WHERE deleted_at IS NULL`;

const COLUMNS: Record<keyof NewTransaction, string> = {
  amountPaise: 'amount_paise',
  direction: 'direction',
  merchant: 'merchant',
  note: 'note',
  categoryId: 'category_id',
  instrument: 'instrument',
  source: 'source',
  occurredAt: 'occurred_at',
};

function assertAmount(paise: number): void {
  if (!Number.isInteger(paise) || paise <= 0) throw new Error('amount must be a positive whole number of paise');
}

export async function addTransaction(
  db: Db,
  input: NewTransaction,
  makeId: () => string = randomUUID,
): Promise<string> {
  assertAmount(input.amountPaise);
  const id = makeId();
  const now = Date.now();
  await db.run(
    `INSERT INTO transactions (id, amount_paise, direction, merchant, note, category_id, instrument, source,
      occurred_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.amountPaise,
      input.direction,
      input.merchant,
      input.note ?? null,
      input.categoryId ?? null,
      input.instrument ?? null,
      input.source,
      input.occurredAt,
      now,
      now,
    ],
  );
  return id;
}

export async function updateTransaction(db: Db, id: string, patch: Partial<NewTransaction>): Promise<void> {
  if (patch.amountPaise !== undefined) assertAmount(patch.amountPaise);
  const entries = Object.entries(patch).filter(([, v]) => v !== undefined) as [keyof NewTransaction, unknown][];
  if (!entries.length) return;
  const sets = entries.map(([k]) => `${COLUMNS[k]} = ?`).join(', ');
  await db.run(`UPDATE transactions SET ${sets}, updated_at = ? WHERE id = ?`, [
    ...entries.map(([, v]) => v),
    Date.now(),
    id,
  ]);
}

export async function softDeleteTransaction(db: Db, id: string): Promise<void> {
  const now = Date.now();
  await db.run('UPDATE transactions SET deleted_at = ?, updated_at = ? WHERE id = ?', [now, now, id]);
}

export async function listTransactions(
  db: Db,
  opts: { from?: number; to?: number; limit?: number; uncategorisedFirst?: boolean },
): Promise<Transaction[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.from !== undefined) {
    where.push('occurred_at >= ?');
    params.push(opts.from);
  }
  if (opts.to !== undefined) {
    where.push('occurred_at < ?');
    params.push(opts.to);
  }
  const order = opts.uncategorisedFirst ? '(category_id IS NOT NULL), occurred_at DESC' : 'occurred_at DESC';
  const limit = opts.limit !== undefined ? ' LIMIT ?' : '';
  if (opts.limit !== undefined) params.push(opts.limit);
  return db.all<Transaction>(
    `${SELECT}${where.map((w) => ` AND ${w}`).join('')} ORDER BY ${order}${limit}`,
    params,
  );
}

export async function cycleSpendPaise(db: Db, from: number, to: number): Promise<number> {
  const row = await db.first<{ total: number | null }>(
    `SELECT SUM(amount_paise) AS total FROM transactions
      WHERE deleted_at IS NULL AND direction = 'debit' AND occurred_at >= ? AND occurred_at < ?`,
    [from, to],
  );
  return row?.total ?? 0;
}
