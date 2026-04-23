'use client';

import * as React from 'react';
import { HelpCircle, Maximize2, Minimize2, Sparkles, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SheetClose, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAssistant } from './AssistantProvider';

interface HeaderProps {
  onOpenShortcuts: () => void;
}

export function AssistantHeader({ onOpenShortcuts }: HeaderProps) {
  const { state, toggleExpanded, clear } = useAssistant();
  const canClear = state.messages.length > 0 && !state.streaming;

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-foreground" aria-hidden="true" />
        <SheetTitle className="text-sm font-medium">Assistant</SheetTitle>
      </div>
      <div className="flex items-center gap-0.5">
        {canClear && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={clear}
                aria-label="Clear conversation"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Clear conversation</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onOpenShortcuts}
              aria-label="Keyboard shortcuts"
            >
              <HelpCircle className="size-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Keyboard shortcuts · ?</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hidden size-8 md:inline-flex"
              onClick={toggleExpanded}
              aria-label={state.isExpanded ? 'Collapse panel' : 'Expand panel'}
              aria-pressed={state.isExpanded}
            >
              {state.isExpanded ? (
                <Minimize2 className="size-4" aria-hidden="true" />
              ) : (
                <Maximize2 className="size-4" aria-hidden="true" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {state.isExpanded ? 'Collapse' : 'Expand'}
          </TooltipContent>
        </Tooltip>
        <SheetClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Close assistant"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </SheetClose>
      </div>
    </header>
  );
}
