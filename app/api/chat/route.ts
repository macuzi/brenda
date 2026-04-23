import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { DEFAULT_MODEL, getAnthropicClient } from '@/lib/ai/client';
import { buildScanContext } from '@/lib/ai/build-context';
import { ASSISTANT_SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { getIssueDetailsTool, runGetIssueDetails } from '@/lib/ai/tools';
import type {
  ChatErrorCode,
  ChatRequestBody,
  ChatStreamEvent,
  ScanResponse,
} from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_MESSAGES = 50;
const MAX_MESSAGE_CHARS = 16_000;
const MAX_TOOL_ITERATIONS = 4;

function classifyError(err: unknown): { code: ChatErrorCode; message: string; retryable: boolean } {
  if (err instanceof Anthropic.RateLimitError) {
    return { code: 'rate_limit', message: 'Rate limited. Try again shortly.', retryable: true };
  }
  if (
    err instanceof Anthropic.APIError &&
    (err.status === 529 || /overloaded/i.test(err.message))
  ) {
    return { code: 'overloaded', message: 'The model is overloaded.', retryable: true };
  }
  if (err instanceof Anthropic.AuthenticationError) {
    return { code: 'auth', message: 'Anthropic API key is invalid.', retryable: false };
  }
  if (err instanceof Anthropic.BadRequestError) {
    return { code: 'bad_request', message: err.message, retryable: false };
  }
  if (err instanceof Anthropic.APIError) {
    return { code: 'unknown', message: err.message, retryable: err.status >= 500 };
  }
  return {
    code: 'network',
    message: err instanceof Error ? err.message : 'Unknown error',
    retryable: true,
  };
}

function toMessageParams(
  messages: ChatRequestBody['messages'],
): Anthropic.MessageParam[] {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

function validate(body: unknown): ChatRequestBody {
  if (!body || typeof body !== 'object') throw new Error('invalid body');
  const b = body as Partial<ChatRequestBody>;
  if (!Array.isArray(b.messages)) throw new Error('messages must be an array');
  if (b.messages.length === 0) throw new Error('messages must not be empty');
  if (b.messages.length > MAX_MESSAGES) throw new Error(`messages exceeds ${MAX_MESSAGES}`);
  for (const m of b.messages) {
    if (m.role !== 'user' && m.role !== 'assistant') throw new Error('invalid role');
    if (typeof m.content !== 'string') throw new Error('content must be a string');
    if (m.content.length > MAX_MESSAGE_CHARS) throw new Error('message too long');
  }
  const scan = (b.scan ?? null) as ScanResponse | null;
  return { messages: b.messages, scan };
}

export async function POST(request: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = validate(await request.json());
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'invalid body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatStreamEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        const client = getAnthropicClient();
        const system = [
          { type: 'text' as const, text: ASSISTANT_SYSTEM_PROMPT },
          { type: 'text' as const, text: buildScanContext(body.scan) },
        ];
        const messages = toMessageParams(body.messages);

        // Manual tool-use loop. Stream text deltas on every iteration, execute
        // the tool server-side on stop_reason === 'tool_use', and feed the
        // tool_result back as the next user turn until we hit end_turn.
        for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
          const streamed = client.messages.stream({
            model: DEFAULT_MODEL,
            max_tokens: 4096,
            system,
            tools: [getIssueDetailsTool],
            messages,
          });

          streamed.on('text', (delta) => {
            send({ type: 'token', delta });
          });

          const finalMessage = await streamed.finalMessage();

          if (finalMessage.stop_reason !== 'tool_use') {
            send({ type: 'done' });
            controller.close();
            return;
          }

          const toolUses = finalMessage.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
          );

          messages.push({ role: 'assistant', content: finalMessage.content });

          const toolResults: Anthropic.ToolResultBlockParam[] = toolUses.map((tu) => {
            if (tu.name !== 'get_issue_details') {
              return {
                type: 'tool_result',
                tool_use_id: tu.id,
                content: JSON.stringify({ error: `Unknown tool: ${tu.name}` }),
                is_error: true,
              };
            }
            const input = (tu.input as { rule_id?: string }) ?? {};
            send({ type: 'tool_use', name: tu.name, input });
            const payload = runGetIssueDetails(body.scan, input.rule_id ?? '');
            send({ type: 'tool_result', name: tu.name, ok: true });
            return { type: 'tool_result', tool_use_id: tu.id, content: payload };
          });

          messages.push({ role: 'user', content: toolResults });
        }

        send({
          type: 'error',
          code: 'unknown',
          message: `Tool-use loop exceeded ${MAX_TOOL_ITERATIONS} iterations.`,
          retryable: false,
        });
        controller.close();
      } catch (err) {
        const { code, message, retryable } = classifyError(err);
        send({ type: 'error', code, message, retryable });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
