import { cleanMerchant } from './merchant';
import {
  AMOUNT_PATTERNS,

  BANK_NAMES_IN_TEXT,
  BANK_SENDER_CODES,
  CREDIT_MERCHANT_PATTERNS,
  CREDIT_WORDS,
  DEBIT_MERCHANT_PATTERNS,
  DEBIT_WORDS,
  DROP_PATTERNS,
  INSTRUMENT_PATTERN,
  KNOWN_PACKAGES,
  REF_PATTERN,
} from './rules';
import type { ParsedAlert, RawAlert } from './types';

function bankFromSender(sender: string): string | null {
  const code = sender.toUpperCase().split('-').pop() ?? '';
  return BANK_SENDER_CODES[code] ?? null;
}

function bankFromText(text: string): string | null {
  return BANK_NAMES_IN_TEXT.find(([re]) => re.test(text))?.[1] ?? null;
}

function toPaise(amount: string): number {
  const [whole, frac = ''] = amount.replace(/,/g, '').split('.');
  return Number(whole) * 100 + Number(frac.padEnd(2, '0').slice(0, 2));
}

function findAmount(text: string): number | null {
  for (const re of AMOUNT_PATTERNS) {
    const m = re.exec(text);
    if (m) return toPaise(m[1]);
  }
  return null;
}

function findDirection(text: string): 'debit' | 'credit' | null {
  const d = DEBIT_WORDS.exec(text)?.index ?? -1;
  const c = CREDIT_WORDS.exec(text)?.index ?? -1;
  if (d < 0 && c < 0) return null;
  if (d < 0) return 'credit';
  if (c < 0) return 'debit';
  return d < c ? 'debit' : 'credit';
}

function findMerchant(text: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = re.exec(text);
    if (!m) continue;
    const name = cleanMerchant(m[1].replace(/[.,;:]+$/, ''));
    if (name) return name;
  }
  return null;
}

function trusted(raw: RawAlert): boolean {
  if (raw.source === 'shortcut') return true;
  if (raw.source === 'sms') return bankFromSender(raw.sender) !== null;
  return KNOWN_PACKAGES.some((p) => p.id === raw.sender);
}

export function parseAlert(raw: RawAlert): ParsedAlert | null {
  if (!trusted(raw)) return null;
  const text = raw.text;
  if (DROP_PATTERNS.some((re) => re.test(text) || (raw.title ? re.test(raw.title) : false))) return null;
  const direction = findDirection(text);
  if (!direction) return null;
  const amountPaise = findAmount(text);
  if (!amountPaise) return null;
  const instrument = INSTRUMENT_PATTERN.exec(text)?.[1];
  return {
    amountPaise,
    direction,
    merchant: findMerchant(text, direction === 'debit' ? DEBIT_MERCHANT_PATTERNS : CREDIT_MERCHANT_PATTERNS),
    instrument: instrument ? `XX${instrument}` : null,
    bank: raw.source === 'sms' ? bankFromSender(raw.sender) : bankFromText(text),
    ref: REF_PATTERN.exec(text)?.[1] ?? null,
    occurredAt: raw.receivedAt,
  };
}
