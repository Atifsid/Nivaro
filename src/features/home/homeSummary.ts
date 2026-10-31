import { getCycle } from '@/domain/cycle';

export type HomeSummary = { leftPaise: number; spentRatio: number; overBy: number; dayIndex: number; length: number };

export function homeSummary(input: { now: Date; payday: number; budgetPaise: number; spentPaise: number }): HomeSummary {
  const { dayIndex, length } = getCycle(input.now, input.payday);
  const diff = input.budgetPaise - input.spentPaise;
  const ratio = input.budgetPaise > 0 ? input.spentPaise / input.budgetPaise : 1;
  return {
    leftPaise: Math.max(0, diff),
    spentRatio: Math.min(1, Math.max(0, ratio)),
    overBy: Math.max(0, -diff),
    dayIndex,
    length,
  };
}
