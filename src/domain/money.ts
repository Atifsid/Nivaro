export const MAX_PAISE = 99999999900;

export type ParseResult =
  | { ok: true; paise: number }
  | { ok: false; error: 'empty' | 'invalid' | 'zero' | 'too_large' };

function groupIndian(rupees: string): string {
  if (rupees.length <= 3) return rupees;
  const last3 = rupees.slice(-3);
  let rest = rupees.slice(0, -3);
  const groups: string[] = [];
  while (rest.length > 2) {
    groups.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) groups.unshift(rest);
  return `${groups.join(',')},${last3}`;
}

export function formatINR(paise: number, opts: { sign?: boolean } = {}): string {
  const abs = Math.abs(Math.trunc(paise));
  const rupees = Math.floor(abs / 100);
  const rem = abs % 100;
  const body = `₹${groupIndian(String(rupees))}${rem ? `.${String(rem).padStart(2, '0')}` : ''}`;
  if (paise < 0) return `−${body}`;
  if (opts.sign && paise > 0) return `+${body}`;
  return body;
}

export function parseAmountToPaise(input: string): ParseResult {
  const cleaned = input.replace(/[₹,\s]/g, '');
  if (!cleaned) return { ok: false, error: 'empty' };
  const m = /^(\d*)(?:\.(\d{0,2}))?$/.exec(cleaned);
  if (!m || (!m[1] && !m[2])) return { ok: false, error: 'invalid' };
  const whole = m[1] || '0';
  if (whole.length > 12) return { ok: false, error: 'too_large' };
  const paise = Number(whole) * 100 + Number((m[2] ?? '').padEnd(2, '0'));
  if (paise === 0) return { ok: false, error: 'zero' };
  if (paise > MAX_PAISE) return { ok: false, error: 'too_large' };
  return { ok: true, paise };
}
