'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAssistant } from './AssistantProvider';
import { AssistantEmptyState } from './AssistantEmptyState';
import { MessageMarkdown } from './MessageMarkdown';

function MessageBubble({
  role,
  children,
}: {
  role: 'user' | 'assistant';
  children: React.ReactNode;
}) {
  const isUser = role === 'user';
  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={
          isUser
            ? 'max-w-[85%] rounded-2xl rounded-br-sm border bg-muted px-3.5 py-2 text-sm leading-relaxed text-foreground'
            : 'w-full text-sm leading-relaxed text-foreground'
        }
      >
        {children}
      </div>
    </div>
  );
}

export function AssistantMessages() {
  const { state, retry } = useAssistant();
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const liveRef = React.useRef<HTMLDivElement>(null);

  // Autoscroll on any message / streaming change.
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [state.messages, state.streamingText, state.toolStatus, state.error]);

  // Announce once when the assistant finishes a reply — not every token.
  React.useEffect(() => {
    if (state.streaming) return;
    const last = state.messages[state.messages.length - 1];
    if (!last || last.role !== 'assistant' || !liveRef.current) return;
    liveRef.current.textContent = 'Assistant replied.';
  }, [state.streaming, state.messages]);

  const hasContent = state.messages.length > 0 || state.streaming || state.error;

  return (
    <div
      ref={scrollerRef}
      className="flex-1 overflow-y-auto"
      role="log"
      aria-label="Conversation"
      aria-live="polite"
      aria-atomic="false"
      aria-relevant="additions"
    >
      {!hasContent ? (
        <AssistantEmptyState />
      ) : (
        <div className="flex flex-col gap-4 px-4 py-4">
          {state.messages.map((m, i) => (
            <MessageBubble key={i} role={m.role}>
              <MessageMarkdown text={m.content} />
            </MessageBubble>
          ))}
          {state.streaming && (
            <MessageBubble role="assistant">
              {state.streamingText ? (
                <MessageMarkdown text={state.streamingText} />
              ) : (
                <span className="text-sm text-muted-foreground">Thinking…</span>
              )}
              {state.toolStatus && (
                <p className="mt-2 text-xs text-muted-foreground">{state.toolStatus}</p>
              )}
            </MessageBubble>
          )}
          {state.error && (
            <div
              role="alert"
              className="flex flex-col gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-foreground"
            >
              <div className="flex items-start gap-2">
                <AlertCircle
                  className="mt-0.5 size-4 text-destructive"
                  aria-hidden="true"
                />
                <p className="leading-relaxed">{state.error.message}</p>
              </div>
              {state.error.retryable && (
                <div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={retry}
                    className="gap-1.5"
                  >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    Try again
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Offscreen polite live region for "reply finished" announcement. */}
      <div
        ref={liveRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
}
