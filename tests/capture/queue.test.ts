import { parseQueue } from '@/capture/queue';

const line = (seq: number, text = 'Paid ₹500 to Blinkit') =>
  JSON.stringify({ seq, source: 'notification', sender: 'com.phonepe.app', text, receivedAt: 1 });

test('reads every complete line in order', () => {
  const r = parseQueue([line(1), line(2), line(3)].join('\n') + '\n', 0);
  expect(r.alerts.map((a) => a.seq)).toEqual([1, 2, 3]);
  expect(r.lastSeq).toBe(3);
});

test('drops a half-written last line without failing', () => {
  const r = parseQueue(`${line(1)}\n${line(2)}\n{"seq":3,"source":"sm`, 0);
  expect(r.alerts.map((a) => a.seq)).toEqual([1, 2]);
  expect(r.lastSeq).toBe(2);
});

test('skips lines already read', () => {
  expect(parseQueue([line(1), line(2), line(3)].join('\n'), 2).alerts.map((a) => a.seq)).toEqual([3]);
});

test('an empty queue changes nothing', () => {
  expect(parseQueue('', 7)).toEqual({ alerts: [], lastSeq: 7 });
});

test('lines missing required fields are skipped', () => {
  const r = parseQueue(`${JSON.stringify({ seq: 1, text: 'x' })}\n${line(2)}`, 0);
  expect(r.alerts.map((a) => a.seq)).toEqual([2]);
});
