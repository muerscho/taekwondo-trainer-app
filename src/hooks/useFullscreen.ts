import { useCallback, useEffect, useState } from 'react';

export function useFullscreen(): { isFullscreen: boolean; toggle: () => void; enter: () => void; exit: () => void } {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => !!document.fullscreenElement);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const enter = useCallback(() => {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  const exit = useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const toggle = useCallback(() => { (document.fullscreenElement ? exit : enter)(); }, [enter, exit]);

  return { isFullscreen, toggle, enter, exit };
}
