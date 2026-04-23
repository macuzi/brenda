'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Row {
  label: string;
  keys: string[];
}

const ROWS: Row[] = [
  { label: 'Open / close assistant', keys: ['⌘', 'K'] },
  { label: 'Send message', keys: ['⌘', '↵'] },
  { label: 'New line', keys: ['↵'] },
  { label: 'Edit last message', keys: ['↑'] },
  { label: 'Close assistant', keys: ['Esc'] },
  { label: 'Show these shortcuts', keys: ['?'] },
];

interface ShortcutsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssistantShortcuts({ open, onOpenChange }: ShortcutsProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-[1px]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[60] w-full max-w-sm -translate-x-1/2 -translate-y-1/2',
            'rounded-lg border bg-background p-5 shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        >
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="text-sm font-medium">
              Keyboard shortcuts
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close shortcuts"
              className="rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <X className="size-4" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="sr-only">
            List of keyboard shortcuts for the assistant panel.
          </DialogPrimitive.Description>
          <ul className="mt-4 flex flex-col gap-2.5">
            {ROWS.map((row) => (
              <li key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{row.label}</span>
                <span className="flex items-center gap-1">
                  {row.keys.map((k) => (
                    <kbd
                      key={k}
                      className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
