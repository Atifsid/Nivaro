export type RawAlert = {
  source: 'sms' | 'notification' | 'shortcut';
  sender: string;
  title?: string;
  text: string;
  receivedAt: number;
};

export type ParsedAlert = {
  amountPaise: number;
  direction: 'debit' | 'credit';
  merchant: string | null;
  instrument: string | null;
  bank: string | null;
  ref: string | null;
  occurredAt: number;
};
