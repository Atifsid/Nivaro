import type { RawAlert } from './types';

export type QueuedAlert = RawAlert & { seq: number };

const SOURCES = new Set(['sms', 'notification', 'shortcut']);

function isQueuedAlert(v: unknown): v is QueuedAlert {
  if (!v || typeof v !== 'object') return false;
  const a = v as Record<string, unknown>;
  return (
    typeof a.seq === 'number' &&
    typeof a.text === 'string' &&
    typeof a.sender === 'string' &&
    typeof a.receivedAt === 'number' &&
    SOURCES.has(a.source as string)
  );
}

export function parseQueue(text: string, afterSeq: number): { alerts: QueuedAlert[]; lastSeq: number } {
  const alerts: QueuedAlert[] = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue;
    }
    if (isQueuedAlert(parsed) && parsed.seq > afterSeq) alerts.push(parsed);
  }
  alerts.sort((a, b) => a.seq - b.seq);
  return { alerts, lastSeq: alerts.length ? alerts[alerts.length - 1].seq : afterSeq };
}
