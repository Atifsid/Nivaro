export const KNOWN_PACKAGES: { id: string; label: string; kind: 'upi' | 'bank' | 'wallet' | 'email' }[] = [
  { id: 'com.google.android.apps.nbu.paisa.user', label: 'Google Pay', kind: 'upi' },
  { id: 'com.phonepe.app', label: 'PhonePe', kind: 'upi' },
  { id: 'net.one97.paytm', label: 'Paytm', kind: 'upi' },
  { id: 'in.org.npci.upiapp', label: 'BHIM', kind: 'upi' },
  { id: 'in.amazon.mShop.android.shopping', label: 'Amazon', kind: 'wallet' },
  { id: 'com.dreamplug.androidapp', label: 'CRED', kind: 'wallet' },
  { id: 'com.snapwork.hdfc', label: 'HDFC Bank', kind: 'bank' },
  { id: 'com.csam.icici.bank.imobile', label: 'ICICI iMobile', kind: 'bank' },
  { id: 'com.sbi.lotusintouch', label: 'SBI YONO', kind: 'bank' },
  { id: 'com.axis.mobile', label: 'Axis Mobile', kind: 'bank' },
  { id: 'com.msf.kbank.mobile', label: 'Kotak', kind: 'bank' },
  { id: 'com.google.android.gm', label: 'Gmail', kind: 'email' },
];

export const BANK_SENDER_CODES: Record<string, string> = {
  HDFCBK: 'HDFC',
  ICICIB: 'ICICI',
  SBIINB: 'SBI',
  SBIUPI: 'SBI',
  SBIPSG: 'SBI',
  AXISBK: 'Axis',
  KOTAKB: 'Kotak',
  PNBSMS: 'PNB',
  BOIIND: 'Bank of India',
  CANBNK: 'Canara',
  YESBNK: 'Yes Bank',
  IDFCFB: 'IDFC First',
  INDUSB: 'IndusInd',
};

export const BANK_NAMES_IN_TEXT: [RegExp, string][] = [
  [/\bHDFC\s*Bank\b/i, 'HDFC'],
  [/\bICICI\s*Bank\b/i, 'ICICI'],
  [/\bSBI\b|State Bank/i, 'SBI'],
  [/\bAxis\s*Bank\b/i, 'Axis'],
  [/\bKotak\b/i, 'Kotak'],
];

export const DROP_PATTERNS: RegExp[] = [
  /\botp\b|one time password|verification code|do not share/i,
  /\boffer\b|cashback upto|pre-approved|\bloan\b|emi available|apply now|\bwin\b/i,
];

export const BALANCE_PATTERN = /avl\.?\s*bal|available balance/i;

export const DEBIT_WORDS = /\b(debited|spent|paid|sent|withdrawn|purchase|txn of)\b|डेबिट/i;
export const CREDIT_WORDS = /\b(credited|received|refund|reversed)\b|जमा/i;

export const AMOUNT_PATTERNS: RegExp[] = [
  /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
  /(?:debited by|debited for|credited by)\s*([\d,]+(?:\.\d{1,2})?)/i,
];

export const INSTRUMENT_PATTERN = /(?:^|[^\w])[xX*]{1,4}(\d{3,4})\b/;

export const REF_PATTERN = /(?:upi ref(?:\s*no)?|upi:|ref\s*no\.?|refno|rrn|utr)\s*:?\s*(\d{9,16})/i;

export const DEBIT_MERCHANT_PATTERNS: RegExp[] = [
  /\bvpa\s+([\w.-]+@[\w.]+)/i,
  /\bto\s+([\w.-]+@[\w.]+)/i,
  /\btrf to\s+(.+?)\s+(?:refno|ref|upi|on)\b/i,
  /;\s*([A-Z0-9 &.'-]+?)\s+credited\b/,
  /\bat\s+(.+?)(?:\s+on\b|\.\s|\.$|$)/i,
  /([A-Z][A-Z0-9 &.'-]+)\s+को/,
  /\bpaid to\s+(.+?)(?:\s+(?:on|from|via|ref|upi)\b|\.\s|\.$|$)/i,
  /\bto\s+(.+?)(?:\s+(?:on|from|via|ref|upi)\b|\.\s|\.$|$)/i,
];

export const CREDIT_MERCHANT_PATTERNS: RegExp[] = [/\bfrom\s+(.+?)(?:\s+(?:has|on|via|to)\b|\.\s|\.$|$)/i];
