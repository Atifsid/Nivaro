import { migrate } from '@/db/migrations';
import {
  addTransaction,
  cycleSpendPaise,
  getTransaction,
  listTransactions,
  softDeleteTransaction,
  updateTransaction,
  type NewTransaction,
} from '@/db/transactions';
import { counterIds, nodeDb } from '../helpers/nodeDb';

const base: NewTransaction = {
  amountPaise: 41200,
  direction: 'debit',
  merchant: 'Swiggy',
  source: 'manual',
  occurredAt: 1000,
};

async function setup() {
  const db = nodeDb();
  await migrate(db);
  return { db, ids: counterIds() };
}

test('rejects zero and negative amounts', async () => {
  const { db, ids } = await setup();
  await expect(addTransaction(db, { ...base, amountPaise: 0 }, ids)).rejects.toThrow();
  await expect(addTransaction(db, { ...base, amountPaise: -100 }, ids)).rejects.toThrow();
});

test('cycle spend counts debits only and skips deleted ones', async () => {
  const { db, ids } = await setup();
  await addTransaction(db, base, ids);
  await addTransaction(db, { ...base, amountPaise: 59900, merchant: 'Airtel', occurredAt: 2000 }, ids);
  await addTransaction(db, { ...base, amountPaise: 8200000, direction: 'credit', merchant: 'Salary', occurredAt: 3000 }, ids);
  const gone = await addTransaction(db, { ...base, amountPaise: 1000, occurredAt: 4000 }, ids);
  await softDeleteTransaction(db, gone);
  await addTransaction(db, { ...base, amountPaise: 777, occurredAt: 99999 }, ids);
  expect(await cycleSpendPaise(db, 0, 10000)).toBe(101100);
});

test('uncategorised come first, each group newest first', async () => {
  const { db, ids } = await setup();
  await addTransaction(db, { ...base, categoryId: 'food_delivery', occurredAt: 1 }, ids);
  await addTransaction(db, { ...base, occurredAt: 2 }, ids);
  await addTransaction(db, { ...base, categoryId: 'food_delivery', occurredAt: 3 }, ids);
  await addTransaction(db, { ...base, occurredAt: 4 }, ids);
  const rows = await listTransactions(db, { uncategorisedFirst: true });
  expect(rows.map((r) => r.occurredAt)).toEqual([4, 2, 3, 1]);
});

test('update changes fields and hides deleted rows from lists', async () => {
  const { db, ids } = await setup();
  const id = await addTransaction(db, base, ids);
  await updateTransaction(db, id, { merchant: 'Zomato', categoryId: 'food_delivery' });
  expect((await listTransactions(db, {}))[0]).toMatchObject({ id, merchant: 'Zomato', categoryId: 'food_delivery' });
  await expect(updateTransaction(db, id, { amountPaise: 0 })).rejects.toThrow();
  await softDeleteTransaction(db, id);
  expect(await listTransactions(db, {})).toEqual([]);
});

test('getTransaction returns one live row or null', async () => {
  const { db, ids } = await setup();
  const id = await addTransaction(db, base, ids);
  expect(await getTransaction(db, id)).toMatchObject({ id, merchant: 'Swiggy', amountPaise: 41200 });
  expect(await getTransaction(db, 'missing')).toBeNull();
  await softDeleteTransaction(db, id);
  expect(await getTransaction(db, id)).toBeNull();
});
