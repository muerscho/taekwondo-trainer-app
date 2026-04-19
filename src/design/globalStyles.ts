import { C } from './tokens';

export function injectGlobalStyles() {
  if (document.getElementById('tkd-global-styles')) return;
  const style = document.createElement('style');
  style.id = 'tkd-global-styles';
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box; }
    html, body, #root { margin: 0; padding: 0; height: 100%; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
      background: ${C.bg};
      color: ${C.text};
      -webkit-font-smoothing: antialiased;
      font-size: 14px;
      line-height: 1.5;
    }
    button { font-family: inherit; font-size: inherit; color: inherit; cursor: pointer; }
    button:disabled { cursor: not-allowed; opacity: 0.5; }
    input, select, textarea { font-family: inherit; font-size: inherit; color: inherit; }
    a { color: inherit; }
    :focus-visible { outline: 2px solid ${C.primary}; outline-offset: 2px; border-radius: 6px; }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-thumb { background: ${C.borderStrong}; border-radius: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
    .tkd-sr-only {
      position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
    }
  `;
  document.head.appendChild(style);
}
