import { useEffect, useState } from 'react';
import { BP } from '@/design/tokens';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(detect());
  useEffect(() => {
    const h = () => setBp(detect());
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return bp;
}

function detect(): Breakpoint {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
  if (w < BP.tablet) return 'mobile';
  if (w < BP.desktop) return 'tablet';
  return 'desktop';
}
