import { drainCapture } from '@/capture/drain';
import { migrate } from '@/db/migrations';
import { listTransactions } from '@/db/transactions';
import { counterIds, nodeDb } from '../helpers/nodeDb';

const T = Date.UTC(2026, 9, 31, 6, 30);
const line = (seq: number, text: string, sender = 'VM-HDFCBK', source = 'sms') =>
  JSON.stringify({ seq, source, sender, text, receivedAt: T + seq * 1000 });

const QUEUE = [
  line(1, '123456 is your OTP for txn of Rs 500.00. Do not share.'),
  line(2, 'Rs.500.00 debited from A/c XX1234 to VPA blinkit@hdfcbank. UPI Ref 498765432109'),
  line(3, 'Paid ₹500 to Blinkit', 'com.google.android.apps.nbu.paisa.user', 'notification'),
].join('\n');

async function setup(queue = QUEUE) {
  const db = nodeDb();
  await migrate(db);
  let seq = 0;
  const trimmed: number[] = [];
  const notified: string[] = [];
  const deps = {
    db,
    makeId: counterIds(),
    readQueue: async () => queue,
    trimQueue: async (upTo: number) => {
      trimmed.push(upTo);
    },
    getSeq: async () => seq,
    setSeq: async (s: number) => {
      seq = s;
    },
    notify: async (id: string) => {
      notified.push(id);
    },
  };
  return { db, deps, trimmed, notified, seq: () => seq };
}

test('ingests new alerts once, prompts for the new purchase, and remembers where it got to', async () => {
  const s = await setup();
  expect(await drainCapture(s.deps)).toEqual({ added: 1, merged: 1 });
  expect(s.notified).toHaveLength(1);
  expect(s.seq()).toBe(3);
  expect(s.trimmed).toEqual([3]);
  expect(await listTransactions(s.db, {})).toHaveLength(1);
});

test('running again does nothing new', async () => {
  const s = await setup();
  await drainCapture(s.deps);
  expect(await drainCapture(s.deps)).toEqual({ added: 0, merged: 0 });
  expect(s.notified).toHaveLength(1);
});

test('a failure part-way keeps its place so the next run retries', async () => {
  const s = await setup();
  const original = s.db.run;
  let calls = 0;
  s.db.run = async (sql, params) => {
    if (sql.startsWith('INSERT INTO transactions') && ++calls === 1) throw new Error('disk full');
    return original(sql, params);
  };
  await expect(drainCapture(s.deps)).rejects.toThrow('disk full');
  expect(s.seq()).toBe(1);
  s.db.run = original;
  expect(await drainCapture(s.deps)).toEqual({ added: 1, merged: 1 });
});
