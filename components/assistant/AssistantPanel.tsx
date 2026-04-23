'use client';

import * as React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAssistant } from './AssistantProvider';
import { AssistantHeader } from './AssistantHeader';
import { AssistantMessages } from './AssistantMessages';
import { AssistantComposer } from './AssistantComposer';
import { AssistantShortcuts } from './AssistantShortcuts';
import { useKeyboardShortcut } from './useKeyboardShortcut';

export function AssistantPanel() {
  const { state, close } = useAssistant();
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const composerRef = React.useRef<HTMLTextAreaElement>(null);

  // `?` opens the shortcut cheatsheet from anywhere inside the panel.
  useKeyboardShortcut(
    { key: '?', shift: true, enabled: state.isOpen },
    (e) => {
      // Don't fire while typing in the composer — let the user type a literal `?`.
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT')) return;
      setShortcutsOpen(true);
    },
  );

  // Focus the composer shortly after the panel opens.
  React.useEffect(() => {
    if (!state.isOpen) return;
    const t = setTimeout(() => composerRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [state.isOpen]);

  return (
    <>
      <Sheet
        open={state.isOpen}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <SheetContent
          side="right"
          hideCloseButton
          aria-describedby={undefined}
          className={cn(
            'flex flex-col p-0 transition-[max-width] duration-200',
            // On mobile, slide from bottom as a drawer instead.
            'max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:left-0 max-sm:right-0',
            'max-sm:h-[85vh] max-sm:w-full max-sm:rounded-t-2xl max-sm:border-l-0 max-sm:border-t',
            // Desktop widths (compact vs expanded).
            state.isExpanded ? 'sm:max-w-[720px]' : 'sm:max-w-[480px]',
          )}
        >
          <AssistantHeader onOpenShortcuts={() => setShortcutsOpen(true)} />
          <AssistantMessages />
          <AssistantComposer ref={composerRef} onRequestClose={close} />
        </SheetContent>
      </Sheet>
      <AssistantShortcuts open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  );
}
