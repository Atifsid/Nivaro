import { getCycle } from '@/domain/cycle';

describe('getCycle', () => {
  test('payday 1 gives the calendar month', () => {
    expect(getCycle(new Date(2026, 9, 12), 1)).toMatchObject({
      start: new Date(2026, 9, 1),
      end: new Date(2026, 10, 1),
      dayIndex: 12,
      length: 31,
    });
  });

  test('payday later in the month starts in the previous month', () => {
    expect(getCycle(new Date(2026, 9, 12), 25)).toMatchObject({
      start: new Date(2026, 8, 25),
      end: new Date(2026, 9, 25),
      length: 30,
    });
  });

  test('payday 31 falls back to the last day of February', () => {
    expect(getCycle(new Date(2027, 2, 1), 31)).toMatchObject({
      start: new Date(2027, 1, 28),
      end: new Date(2027, 2, 31),
      length: 31,
    });
  });

  test('payday itself is day 1 of a new cycle', () => {
    expect(getCycle(new Date(2026, 9, 25, 9, 30), 25).dayIndex).toBe(1);
  });

  test('leap year February uses the 29th', () => {
    expect(getCycle(new Date(2028, 2, 5), 30).start).toEqual(new Date(2028, 1, 29));
  });

  test('every day of a year sits inside a positive-length cycle', () => {
    for (const payday of [1, 15, 28, 29, 30, 31]) {
      for (let d = 0; d < 366; d++) {
        const now = new Date(2027, 0, 1 + d, 12);
        const c = getCycle(now, payday);
        expect(c.length).toBeGreaterThan(0);
        expect(now >= c.start && now < c.end).toBe(true);
        expect(c.dayIndex).toBeGreaterThanOrEqual(1);
        expect(c.dayIndex).toBeLessThanOrEqual(c.length);
      }
    }
  });
});
