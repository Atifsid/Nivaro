import { categoryForMerchant, rememberMerchant } from '@/db/merchants';
import { migrate } from '@/db/migrations';
import { addTransaction, updateTransaction } from '@/db/transactions';
import { counterIds, nodeDb } from '../helpers/nodeDb';

test('schema upgrades from version 1 and keeps existing rows', async () => {
  const db = nodeDb();
  await db.exec(`CREATE TABLE transactions (id TEXT PRIMARY KEY, amount_paise INTEGER NOT NULL, direction TEXT NOT NULL,
    merchant TEXT NOT NULL, note TEXT, category_id TEXT, instrument TEXT, source TEXT NOT NULL, occurred_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, deleted_at INTEGER);
    CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE categories (id TEXT PRIMARY KEY, name_key TEXT NOT NULL, icon TEXT NOT NULL, bucket TEXT NOT NULL, sort INTEGER NOT NULL, archived INTEGER NOT NULL DEFAULT 0);
    INSERT INTO transactions VALUES ('old', 100, 'debit', 'Shop', NULL, NULL, NULL, 'manual', 1, 1, 1, NULL);
    PRAGMA user_version = 1;`);
  await migrate(db);
  expect(await db.first<{ user_version: number }>('PRAGMA user_version')).toEqual({ user_version: 2 });
  expect(await db.first('SELECT id, ref, bank, merchant_key FROM transactions')).toEqual({
    id: 'old',
    ref: null,
    bank: null,
    merchant_key: null,
  });
});

test('remembers and overwrites a category per shop', async () => {
  const db = nodeDb();
  await migrate(db);
  await rememberMerchant(db, 'swiggy', 'dining');
  await rememberMerchant(db, 'swiggy', 'food_delivery');
  expect(await categoryForMerchant(db, 'swiggy')).toBe('food_delivery');
  expect(await categoryForMerchant(db, 'zomato')).toBeNull();
});

test('setting a category on a captured spend remembers its shop', async () => {
  const db = nodeDb();
  await migrate(db);
  const id = await addTransaction(
    db,
    { amountPaise: 100, direction: 'debit', merchant: 'Blinkit', merchantKey: 'blinkit', source: 'sms', occurredAt: 1 },
    counterIds(),
  );
  await updateTransaction(db, id, { categoryId: 'groceries' });
  expect(await categoryForMerchant(db, 'blinkit')).toBe('groceries');
});
