import type { ChatRequestBody, ChatStreamEvent } from '@/lib/types';

export async function* streamChat(
  body: ChatRequestBody,
  signal: AbortSignal,
): AsyncGenerator<ChatStreamEvent> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    let message = `Request failed: ${res.status}`;
    try {
      const text = await res.text();
      if (text) message = text;
    } catch {}
    yield { type: 'error', code: 'bad_request', message, retryable: res.status >= 500 };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line; each frame is one or more
    // `data: ...` lines containing a JSON-encoded ChatStreamEvent.
    let sep = buffer.indexOf('\n\n');
    while (sep !== -1) {
      const frame = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const dataLines = frame
        .split('\n')
        .filter((l) => l.startsWith('data: '))
        .map((l) => l.slice(6));
      if (dataLines.length) {
        try {
          yield JSON.parse(dataLines.join('\n')) as ChatStreamEvent;
        } catch {
          // skip malformed frame
        }
      }
      sep = buffer.indexOf('\n\n');
    }
  }
}
