import type { Issue } from '@/lib/types';
import { DEFAULT_MODEL, getAnthropicClient } from './client';

export interface FixSuggestion {
  fixedHtml: string;
  why: string;
}

// Generate a concrete HTML fix for an axe violation plus a plain-English
// explanation of what changes for end users. Uses tool use to force the
// response into a { fixedHtml, why } shape so the client doesn't have to
// parse free-form text.
export async function generateFixSuggestion(
  issue: Issue,
  scanUrl: string,
): Promise<FixSuggestion> {
  const client = getAnthropicClient();
  const sampleHtml = issue.nodes[0]?.html ?? '';
  const failureSummary = issue.nodes[0]?.failureSummary ?? '';

  const prompt = `An accessibility check is failing on a webpage. Propose a concrete fix for the sample element below.

Rule: ${issue.help} (axe rule: \`${issue.id}\`)
Description: ${issue.description}
Page: ${scanUrl}

Failing element:
\`\`\`html
${sampleHtml}
\`\`\`
${failureSummary ? `\nAxe diagnostic:\n${failureSummary}\n` : ''}
Return two things via the suggest_fix tool:

1. fixedHtml — the same element, edited to fix the issue. Keep the same tag and layout-relevant attributes; change or add only what's needed. If the fix needs specific content you can't know (like a button's label), use a clear, realistic placeholder (e.g. aria-label="Close dialog" or the visible text "Submit").

2. why — ONE plain-English sentence explaining what improves for the end user. No developer jargon. Do NOT say "ARIA", "semantic HTML", "DOM", "assistive technology". Prefer everyday phrases like "people who have the page read aloud to them", "people browsing without a mouse", "people using voice control".`;

  const message = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1500,
    tools: [
      {
        name: 'suggest_fix',
        description: 'Propose a concrete fix for an accessibility issue.',
        input_schema: {
          type: 'object',
          properties: {
            fixedHtml: {
              type: 'string',
              description: 'The corrected HTML for the failing element.',
            },
            why: {
              type: 'string',
              description:
                'One plain-English sentence explaining what improves for end users. No developer jargon.',
            },
          },
          required: ['fixedHtml', 'why'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'suggest_fix' },
    messages: [{ role: 'user', content: prompt }],
  });

  const toolUse = message.content.find((b) => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Model did not return a fix suggestion');
  }
  const input = toolUse.input as { fixedHtml?: unknown; why?: unknown };
  if (typeof input.fixedHtml !== 'string' || typeof input.why !== 'string') {
    throw new Error('Fix suggestion returned in unexpected shape');
  }
  return { fixedHtml: input.fixedHtml, why: input.why };
}
