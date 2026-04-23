'use client';

import * as React from 'react';
import type { ChatMessage, ChatStreamEvent, ScanResponse } from '@/lib/types';
import { streamChat } from './stream-client';

const STORAGE_KEY = 'brenda.assistant.v1';

export interface AssistantError {
  code: string;
  message: string;
  retryable: boolean;
}

interface AssistantState {
  isOpen: boolean;
  isExpanded: boolean;
  messages: ChatMessage[];
  streaming: boolean;
  streamingText: string;
  error: AssistantError | null;
  toolStatus: string | null;
  scan: ScanResponse | null;
}

type Action =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'toggle-expanded' }
  | { type: 'set-scan'; scan: ScanResponse | null }
  | { type: 'submit-start'; userMessage: ChatMessage }
  | { type: 'token'; delta: string }
  | { type: 'tool-use'; name: string }
  | { type: 'tool-result' }
  | { type: 'done' }
  | { type: 'error'; error: AssistantError }
  | { type: 'abort' }
  | { type: 'retry-clear' }
  | { type: 'pop-last-user'; content: string }
  | { type: 'clear' }
  | { type: 'hydrate'; messages: ChatMessage[] };

const initial: AssistantState = {
  isOpen: false,
  isExpanded: false,
  messages: [],
  streaming: false,
  streamingText: '',
  error: null,
  toolStatus: null,
  scan: null,
};

function reducer(state: AssistantState, action: Action): AssistantState {
  switch (action.type) {
    case 'open':
      return { ...state, isOpen: true };
    case 'close':
      return { ...state, isOpen: false, isExpanded: false };
    case 'toggle-expanded':
      return { ...state, isExpanded: !state.isExpanded };
    case 'set-scan':
      return { ...state, scan: action.scan };
    case 'submit-start':
      return {
        ...state,
        messages: [...state.messages, action.userMessage],
        streaming: true,
        streamingText: '',
        error: null,
        toolStatus: null,
      };
    case 'token':
      return { ...state, streamingText: state.streamingText + action.delta };
    case 'tool-use':
      return { ...state, toolStatus: `Looking up ${action.name}…` };
    case 'tool-result':
      return { ...state, toolStatus: null };
    case 'done':
      return {
        ...state,
        messages: state.streamingText
          ? [...state.messages, { role: 'assistant', content: state.streamingText }]
          : state.messages,
        streamingText: '',
        streaming: false,
        toolStatus: null,
      };
    case 'error':
      return {
        ...state,
        streaming: false,
        toolStatus: null,
        error: action.error,
        // If a partial assistant response accumulated, keep it as a message.
        messages: state.streamingText
          ? [...state.messages, { role: 'assistant', content: state.streamingText }]
          : state.messages,
        streamingText: '',
      };
    case 'abort':
      return {
        ...state,
        streaming: false,
        streamingText: '',
        toolStatus: null,
      };
    case 'retry-clear':
      return { ...state, error: null };
    case 'pop-last-user': {
      // Remove the last user message and any trailing assistant reply so it can be edited.
      const msgs = [...state.messages];
      while (msgs.length && msgs[msgs.length - 1]!.role === 'assistant') msgs.pop();
      if (msgs.length && msgs[msgs.length - 1]!.role === 'user') msgs.pop();
      return { ...state, messages: msgs };
    }
    case 'clear':
      return { ...state, messages: [], streamingText: '', error: null, toolStatus: null };
    case 'hydrate':
      return { ...state, messages: action.messages };
    default:
      return state;
  }
}

interface AssistantContextValue {
  state: AssistantState;
  open: () => void;
  close: () => void;
  toggleExpanded: () => void;
  send: (content: string) => void;
  retry: () => void;
  abort: () => void;
  editLastUser: () => string | null;
  clear: () => void;
  setScan: (scan: ScanResponse | null) => void;
}

const AssistantContext = React.createContext<AssistantContextValue | null>(null);

export function useAssistant(): AssistantContextValue {
  const ctx = React.useContext(AssistantContext);
  if (!ctx) throw new Error('useAssistant must be used within AssistantProvider');
  return ctx;
}

interface ProviderProps {
  children: React.ReactNode;
  scan?: ScanResponse | null;
}

export function AssistantProvider({ children, scan = null }: ProviderProps) {
  const [state, dispatch] = React.useReducer(reducer, initial);
  const abortRef = React.useRef<AbortController | null>(null);
  const hydratedRef = React.useRef(false);

  // Keep scan prop in sync.
  React.useEffect(() => {
    dispatch({ type: 'set-scan', scan });
  }, [scan]);

  // Hydrate message history from sessionStorage on mount.
  React.useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { messages?: ChatMessage[] };
      if (Array.isArray(parsed.messages)) {
        dispatch({ type: 'hydrate', messages: parsed.messages });
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  // Persist messages across reloads (per-session).
  React.useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ messages: state.messages }),
      );
    } catch {
      // ignore quota / availability errors
    }
  }, [state.messages]);

  const run = React.useCallback(
    async (messages: ChatMessage[], scanSnapshot: ScanResponse | null) => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const gen = streamChat({ messages, scan: scanSnapshot }, controller.signal);
        for await (const evt of gen as AsyncGenerator<ChatStreamEvent>) {
          if (controller.signal.aborted) return;
          switch (evt.type) {
            case 'token':
              dispatch({ type: 'token', delta: evt.delta });
              break;
            case 'tool_use':
              dispatch({ type: 'tool-use', name: evt.name });
              break;
            case 'tool_result':
              dispatch({ type: 'tool-result' });
              break;
            case 'done':
              dispatch({ type: 'done' });
              return;
            case 'error':
              dispatch({
                type: 'error',
                error: {
                  code: evt.code,
                  message: evt.message,
                  retryable: evt.retryable,
                },
              });
              return;
          }
        }
        dispatch({ type: 'done' });
      } catch (err) {
        if (controller.signal.aborted) return;
        dispatch({
          type: 'error',
          error: {
            code: 'network',
            message: err instanceof Error ? err.message : 'Network error',
            retryable: true,
          },
        });
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [],
  );

  const send = React.useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || state.streaming) return;
      const userMessage: ChatMessage = { role: 'user', content: trimmed };
      dispatch({ type: 'submit-start', userMessage });
      void run([...state.messages, userMessage], state.scan);
    },
    [run, state.messages, state.scan, state.streaming],
  );

  const retry = React.useCallback(() => {
    if (state.streaming) return;
    // Re-run from existing message history (the last user message is already there
    // because we only append the assistant reply on 'done').
    dispatch({ type: 'retry-clear' });
    const lastUserIdx = state.messages.map((m) => m.role).lastIndexOf('user');
    if (lastUserIdx === -1) return;
    // Reset streaming flag via submit-start substitute: simply mark streaming on.
    void run(state.messages.slice(0, lastUserIdx + 1), state.scan);
  }, [run, state.messages, state.scan, state.streaming]);

  const abort = React.useCallback(() => {
    abortRef.current?.abort();
    dispatch({ type: 'abort' });
  }, []);

  const editLastUser = React.useCallback((): string | null => {
    const last = [...state.messages].reverse().find((m) => m.role === 'user');
    if (!last) return null;
    dispatch({ type: 'pop-last-user', content: last.content });
    return last.content;
  }, [state.messages]);

  const clear = React.useCallback(() => dispatch({ type: 'clear' }), []);

  const value: AssistantContextValue = {
    state,
    open: () => dispatch({ type: 'open' }),
    close: () => {
      abortRef.current?.abort();
      dispatch({ type: 'close' });
    },
    toggleExpanded: () => dispatch({ type: 'toggle-expanded' }),
    send,
    retry,
    abort,
    editLastUser,
    clear,
    setScan: (s) => dispatch({ type: 'set-scan', scan: s }),
  };

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}
