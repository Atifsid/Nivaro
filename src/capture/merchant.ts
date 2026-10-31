const SUFFIXES = /\b(private limited|pvt\.? ltd\.?|pvt|limited|ltd\.?|india)\b/gi;

function titleWord(w: string): string {
  return w === w.toUpperCase() || w === w.toLowerCase() ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w;
}

export function cleanMerchant(raw: string): string {
  const noHandle = raw.split('@')[0];
  const cleaned = noHandle.replace(SUFFIXES, ' ').replace(/[._]+/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned.split(' ').map(titleWord).join(' ');
}

export function merchantKey(raw: string): string {
  return cleanMerchant(raw).toLowerCase().replace(/[^a-z0-9]/g, '');
}
