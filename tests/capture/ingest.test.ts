import { ingestAlert } from '@/capture/ingest';
import type { RawAlert } from '@/capture/types';
import { rememberMerchant } from '@/db/merchants';
import { migrate } from '@/db/migrations';
import { listTransactions } from '@/db/transactions';
import { counterIds, nodeDb } from '../helpers/nodeDb';

const T = Date.UTC(2026, 9, 31, 6, 30);
const MIN = 60_000;

async function setup() {
  const db = nodeDb();
  await migrate(db);
  return { db, ids: counterIds() };
}

const bankSms = (at: number, ref = '498765432109'): RawAlert => ({
  source: 'sms',
  sender: 'VM-HDFCBK',
  text: `Rs.500.00 debited from A/c XX1234 to VPA blinkit.payu@hdfcbank on 31-10-26. UPI Ref ${ref}.`,
  receivedAt: at,
});
const bankApp = (at: number): RawAlert => ({
  source: 'notification',
  sender: 'com.snapwork.hdfc',
  text: 'Rs 500.00 debited from HDFC Bank A/c XX1234',
  receivedAt: at,
});
const gpay = (at: number): RawAlert => ({
  source: 'notification',
  sender: 'com.google.android.apps.nbu.paisa.user',
  text: 'Paid ₹500 to Blinkit',
  receivedAt: at,
});

test('one payment seen three ways is stored once with the clearest shop name', async () => {
  const { db, ids } = await setup();
  expect((await ingestAlert(db, bankSms(T), ids)).status).toBe('added');
  expect((await ingestAlert(db, bankApp(T + MIN), ids)).status).toBe('merged');
  expect((await ingestAlert(db, gpay(T + 3 * MIN), ids)).status).toBe('merged');
  const rows = await listTransactions(db, {});
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({ amountPaise: 50000, merchant: 'Blinkit', instrument: 'XX1234', ref: '498765432109' });
});

test('the same reference number much later is still the same payment', async () => {
  const { db, ids } = await setup();
  await ingestAlert(db, bankSms(T), ids);
  expect((await ingestAlert(db, bankSms(T + 120 * MIN), ids)).status).toBe('merged');
});

test('two real payments of the same amount with different references are both kept', async () => {
  const { db, ids } = await setup();
  await ingestAlert(db, bankSms(T, '111111111111'), ids);
  expect((await ingestAlert(db, bankSms(T + MIN, '222222222222'), ids)).status).toBe('added');
  expect(await listTransactions(db, {})).toHaveLength(2);
});

test('an OTP is ignored and nothing is stored', async () => {
  const { db, ids } = await setup();
  const otp: RawAlert = { ...bankSms(T), text: '123456 is your OTP for txn of Rs 500.00. Do not share.' };
  expect((await ingestAlert(db, otp, ids)).status).toBe('ignored');
  expect(await listTransactions(db, {})).toEqual([]);
});

test('a remembered shop gets its category and needs no prompt', async () => {
  const { db, ids } = await setup();
  await rememberMerchant(db, 'blinkit', 'groceries');
  const r = await ingestAlert(db, gpay(T), ids);
  expect(r).toMatchObject({ status: 'added', needsCategory: false });
  expect((await listTransactions(db, {}))[0].categoryId).toBe('groceries');
});

test('a new purchase needs a category but a credit does not', async () => {
  const { db, ids } = await setup();
  expect(await ingestAlert(db, gpay(T), ids)).toMatchObject({ needsCategory: true });
  const salary: RawAlert = {
    source: 'sms',
    sender: 'VM-HDFCBK',
    text: 'INR 82,000.00 credited to HDFC Bank A/c XX1234 for NEFT salary',
    receivedAt: T,
  };
  expect(await ingestAlert(db, salary, ids)).toMatchObject({ status: 'added', needsCategory: false });
});
