import { useCallback, useRef, useState } from 'react';

export function useSubmitGuard() {
  const running = useRef(false);
  const [busy, setBusy] = useState(false);

  const run = useCallback(async (action: () => Promise<void>) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    try {
      await action();
    } finally {
      running.current = false;
      setBusy(false);
    }
  }, []);

  return { run, busy };
}
