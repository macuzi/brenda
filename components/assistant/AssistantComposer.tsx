'use client';

import * as React from 'react';
import { Paperclip, Send, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAssistant } from './AssistantProvider';

const MAX_ROWS = 6;
const MIN_ROWS = 1;

interface ComposerProps {
  onRequestClose: () => void;
}

export const AssistantComposer = React.forwardRef<HTMLTextAreaElement, ComposerProps>(
  function AssistantComposer({ onRequestClose }, forwardedRef) {
    const { state, send, abort, editLastUser } = useAssistant();
    const [value, setValue] = React.useState('');
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

    const setRefs = (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    // Auto-grow between MIN_ROWS and MAX_ROWS.
    React.useLayoutEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = 'auto';
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight || '20');
      const max = lineHeight * MAX_ROWS + 16; // +padding
      const next = Math.min(el.scrollHeight, max);
      el.style.height = `${next}px`;
      el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
    }, [value]);

    const submit = () => {
      const trimmed = value.trim();
      if (!trimmed || state.streaming) return;
      send(trimmed);
      setValue('');
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        submit();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onRequestClose();
        return;
      }
      // ↑ with empty textarea pulls the last user message back for editing.
      if (e.key === 'ArrowUp' && value === '' && !state.streaming) {
        const prev = editLastUser();
        if (prev != null) {
          e.preventDefault();
          setValue(prev);
          // Move cursor to end after React flushes.
          requestAnimationFrame(() => {
            const el = innerRef.current;
            if (el) el.setSelectionRange(el.value.length, el.value.length);
          });
        }
      }
    };

    const canSend = value.trim().length > 0 && !state.streaming;

    return (
      <div className="border-t bg-background">
        <form
          className="flex flex-col gap-2 px-3 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="flex items-end gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0"
                    disabled
                    aria-label="Attach (coming soon)"
                  >
                    <Paperclip className="size-4" aria-hidden="true" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">Attach · coming soon</TooltipContent>
            </Tooltip>
            <label htmlFor="assistant-composer" className="sr-only">
              Message
            </label>
            <textarea
              id="assistant-composer"
              ref={setRefs}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              rows={MIN_ROWS}
              placeholder="Ask about your scan, WCAG, or a specific fix…"
              className={cn(
                'flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm leading-6 text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
              disabled={state.streaming}
              aria-describedby="assistant-composer-hint"
            />
            {state.streaming ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 shrink-0"
                onClick={abort}
                aria-label="Stop generating"
              >
                <StopCircle className="size-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                className="size-9 shrink-0"
                disabled={!canSend}
                aria-label="Send message"
              >
                <Send className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>
          <div
            id="assistant-composer-hint"
            className="flex items-center justify-between px-1 text-[11px] text-muted-foreground"
          >
            <span>
              <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">⌘</kbd>{' '}
              <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">↵</kbd>{' '}
              to send · <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">↵</kbd>{' '}
              for new line
            </span>
            <span>Responses are AI-generated and may contain mistakes.</span>
          </div>
        </form>
      </div>
    );
  },
);
