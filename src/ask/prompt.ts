import type { RetrievedChunk } from './types';

function formatChunk(chunk: RetrievedChunk, index: number): string {
  const { metadata, document } = chunk;
  const wcag = metadata.wcag_sc ? ` (WCAG ${metadata.wcag_sc})` : '';

  return `[${index + 1}] ${metadata.title}${wcag}
URL: ${metadata.url}
${document}`;
}

export function buildPrompt(
  question: string,
  chunks: RetrievedChunk[],
): { system: string; user: string } {
  const context = chunks.map(formatChunk).join('\n\n');

  const system = `You are Brenda, an accessibility assistant. Answer only using the retrieved source excerpts below.

Rules:
- If the sources cannot support a confident answer, say "Insufficient sources to answer this question."
- Do not invent requirements, techniques, or URLs.
- Prefer WCAG/WAI guidance over general web advice.
- Be practical and concise.
- Do not use bracket citations like [1] or inline "(Source: ...)" in your answer.
- Copy source titles and URLs exactly into the Sources section.

Respond in exactly this format:

Answer: <direct yes/no or short answer>

Why: <1-3 sentences grounded in the sources, no inline citations>

Sources:
- <source title> — <url>
(list every source you used; at least one when you give an answer)

Practical fix: <one concrete recommendation, or "None" if not applicable>`;

  const user = `Question: ${question}

Retrieved sources:
${context}`;

  return { system, user };
}
