'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { useAssistant } from './AssistantProvider';
import { suggestionsFor } from './suggestions';

export function AssistantEmptyState() {
  const { state, send } = useAssistant();
  const suggestions = React.useMemo(() => suggestionsFor(state.scan), [state.scan]);

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <div className="flex flex-col items-start gap-2">
        <div className="flex size-8 items-center justify-center rounded-full border bg-muted">
          <Sparkles className="size-4" aria-hidden="true" />
        </div>
        <h2 className="text-base font-medium text-foreground">How can I help?</h2>
        <p className="text-sm text-muted-foreground">
          Ask about WCAG rules, your scan results, or how to fix a specific issue.
        </p>
      </div>
      <ul className="flex flex-col gap-2" aria-label="Suggested questions">
        {suggestions.map((s) => (
          <li key={s.label}>
            <button
              type="button"
              onClick={() => send(s.prompt)}
              className="w-full rounded-md border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
