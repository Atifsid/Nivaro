export type Cycle = { start: Date; end: Date; dayIndex: number; length: number };

const DAY = 86_400_000;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function paydayIn(year: number, month: number, payday: number): Date {
  return new Date(year, month, Math.min(payday, daysInMonth(year, month)));
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY);
}

export function getCycle(now: Date, payday: number): Cycle {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start = paydayIn(today.getFullYear(), today.getMonth(), payday);
  if (start > today) start = paydayIn(today.getFullYear(), today.getMonth() - 1, payday);
  const end = paydayIn(start.getFullYear(), start.getMonth() + 1, payday);
  return {
    start,
    end,
    dayIndex: daysBetween(start, today) + 1,
    length: daysBetween(start, end),
  };
}
