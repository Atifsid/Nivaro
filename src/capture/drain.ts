import type { Db } from '@/db/types';

import { ingestAlert } from './ingest';
import { parseQueue } from './queue';

export type DrainDeps = {
  db: Db;
  readQueue: () => Promise<string>;
  trimQueue: (upToSeq: number) => Promise<void>;
  getSeq: () => Promise<number>;
  setSeq: (seq: number) => Promise<void>;
  notify: (transactionId: string) => Promise<void>;
  makeId?: () => string;
};

export async function drainCapture(deps: DrainDeps): Promise<{ added: number; merged: number }> {
  const { alerts } = parseQueue(await deps.readQueue(), await deps.getSeq());
  let added = 0;
  let merged = 0;
  for (const alert of alerts) {
    const result = await ingestAlert(deps.db, alert, deps.makeId);
    if (result.status === 'added') added++;
    if (result.status === 'merged') merged++;
    await deps.setSeq(alert.seq);
    if (result.needsCategory && result.id) await deps.notify(result.id);
  }
  if (alerts.length) await deps.trimQueue(alerts[alerts.length - 1].seq);
  return { added, merged };
}
