import { parseAmountToPaise } from '@/domain/money';

export type TxFormResult =
  | { ok: true; amountPaise: number; merchant: string }
  | { ok: false; errors: { amount?: string; merchant?: string } };

export function validateTxForm(input: { amount: string; merchant: string }): TxFormResult {
  const parsed = parseAmountToPaise(input.amount);
  const merchant = input.merchant.trim();
  const errors: { amount?: string; merchant?: string } = {};
  if (!parsed.ok) errors.amount = `errors.amount.${parsed.error}`;
  if (!merchant) errors.merchant = 'errors.merchant';
  if (!parsed.ok || !merchant) return { ok: false, errors };
  return { ok: true, amountPaise: parsed.paise, merchant };
}
