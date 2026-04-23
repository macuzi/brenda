'use client';

import * as React from 'react';

export interface ShortcutOptions {
  key: string;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
  enabled?: boolean;
  target?: Window | Document | HTMLElement | null;
}

/**
 * Global keyboard shortcut hook. `meta: true` matches either the Meta (⌘) key
 * on macOS or the Control key on other platforms, so ⌘K and Ctrl+K both work.
 */
export function useKeyboardShortcut(
  opts: ShortcutOptions,
  handler: (event: KeyboardEvent) => void,
) {
  const handlerRef = React.useRef(handler);
  handlerRef.current = handler;

  React.useEffect(() => {
    if (opts.enabled === false) return;
    const target = opts.target ?? (typeof window !== 'undefined' ? window : null);
    if (!target) return;

    const onKey = (event: Event) => {
      const e = event as KeyboardEvent;
      if (e.key.toLowerCase() !== opts.key.toLowerCase()) return;
      if (opts.meta && !(e.metaKey || e.ctrlKey)) return;
      if (opts.meta === false && (e.metaKey || e.ctrlKey)) return;
      if (opts.shift != null && e.shiftKey !== opts.shift) return;
      if (opts.alt != null && e.altKey !== opts.alt) return;
      if (opts.preventDefault) e.preventDefault();
      handlerRef.current(e);
    };

    target.addEventListener('keydown', onKey);
    return () => target.removeEventListener('keydown', onKey);
  }, [opts.key, opts.meta, opts.shift, opts.alt, opts.preventDefault, opts.enabled, opts.target]);
}
