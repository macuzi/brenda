'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAssistant } from './AssistantProvider';
import { useKeyboardShortcut } from './useKeyboardShortcut';

export const AssistantTrigger = React.forwardRef<HTMLButtonElement>((_, forwardedRef) => {
  const { state, open, close } = useAssistant();
  const internalRef = React.useRef<HTMLButtonElement | null>(null);

  // Merge refs so the parent can retrieve focus management.
  const setRefs = (node: HTMLButtonElement | null) => {
    internalRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  useKeyboardShortcut(
    { key: 'k', meta: true, preventDefault: true },
    () => {
      if (state.isOpen) close();
      else open();
    },
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={setRefs}
          variant="outline"
          size="sm"
          onClick={() => (state.isOpen ? close() : open())}
          aria-label="Open assistant"
          aria-haspopup="dialog"
          aria-expanded={state.isOpen}
          className="gap-2 font-normal"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          <span>Assistant</span>
          <kbd className="ml-1 hidden items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
            <span aria-hidden="true">⌘</span>
            <span>K</span>
          </kbd>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Ask brenda · ⌘K</TooltipContent>
    </Tooltip>
  );
});
AssistantTrigger.displayName = 'AssistantTrigger';
