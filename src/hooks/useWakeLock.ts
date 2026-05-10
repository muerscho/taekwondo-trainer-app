import { useEffect, useRef } from 'react';

type AnySentinel = { release: () => Promise<void> } | null;

export function useWakeLock(active: boolean): void {
  const sentinelRef = useRef<AnySentinel>(null);

  useEffect(() => {
    let cancelled = false;
    const nav: any = typeof navigator !== 'undefined' ? navigator : null;
    const wl = nav?.wakeLock;

    const acquire = async () => {
      if (!wl?.request) return;
      try {
        const s = await wl.request('screen');
        if (cancelled) { try { await s.release(); } catch {} return; }
        sentinelRef.current = s;
        s.addEventListener?.('release', () => { if (sentinelRef.current === s) sentinelRef.current = null; });
      } catch { /* ignore — some browsers reject when tab is hidden */ }
    };

    const release = async () => {
      const s = sentinelRef.current;
      sentinelRef.current = null;
      if (s) { try { await s.release(); } catch {} }
    };

    const onVisibility = () => {
      if (!active) return;
      if (document.visibilityState === 'visible' && !sentinelRef.current) acquire();
    };

    if (active) {
      acquire();
      document.addEventListener('visibilitychange', onVisibility);
    }

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      release();
    };
  }, [active]);
}
