import type { AskConfig } from './config';
import type { AskResult, AskSource } from './types';
import type { RetrievedChunk } from './types';

function parseSection(text: string, label: string): string {
  const pattern = new RegExp(
    `${label}:\\s*([\\s\\S]*?)(?=\\n(?:Answer|Why|Sources|Practical fix):|$)`,
    'i',
  );
  const match = text.match(pattern);
  return match?.[1]?.trim() ?? '';
}

function isNoneLine(line: string): boolean {
  const normalized = line.toLowerCase().replace(/^[-*]\s*/, '').trim();
  return (
    normalized === 'none' ||
    normalized === 'none cited' ||
    normalized === 'n/a'
  );
}

function parseSources(text: string): AskSource[] {
  const sourcesBlock = parseSection(text, 'Sources');
  if (!sourcesBlock) {
    return [];
  }

  const sources: AskSource[] = [];

  for (const line of sourcesBlock.split('\n')) {
    const trimmed = line.replace(/^[-*]\s*/, '').trim();
    if (!trimmed || isNoneLine(trimmed)) {
      continue;
    }

    const match = trimmed.match(/^(.*?)\s*[—-]\s*(https?:\/\/\S+)/);
    if (match) {
      sources.push({
        title: match[1].trim(),
        url: match[2].trim(),
      });
      continue;
    }

    const urlMatch = trimmed.match(/(https?:\/\/\S+)/);
    if (urlMatch) {
      sources.push({
        title: trimmed.replace(urlMatch[0], '').replace(/[—-]\s*$/, '').trim(),
        url: urlMatch[0],
      });
    }
  }

  return sources;
}

export function cleanWhy(text: string): string {
  return text
    .replace(/\s*\(Source:\s*\[\d+\][^)]*\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function chunkToSource(chunk: RetrievedChunk): AskSource {
  return {
    title: chunk.metadata.title,
    url: chunk.metadata.url,
    wcag_sc: chunk.metadata.wcag_sc,
  };
}

function dedupeSources(sources: AskSource[]): AskSource[] {
  const seen = new Set<string>();

  return sources.filter((source) => {
    if (!source.url || seen.has(source.url)) {
      return false;
    }

    seen.add(source.url);
    return true;
  });
}

function sourcesFromCitations(
  text: string,
  chunks: RetrievedChunk[],
): AskSource[] {
  const indices = [...text.matchAll(/\[(\d+)\]/g)].map((match) =>
    Number(match[1]) - 1,
  );
  const unique = [...new Set(indices)].filter(
    (index) => index >= 0 && index < chunks.length,
  );

  if (unique.length === 0) {
    return [];
  }

  return dedupeSources(unique.map((index) => chunkToSource(chunks[index])));
}

function sourcesFromChunks(chunks: RetrievedChunk[]): AskSource[] {
  return dedupeSources(chunks.map(chunkToSource));
}

export function finalizeAskResult(
  parsed: AskResult,
  raw: string,
  chunks: RetrievedChunk[],
): AskResult {
  const why = cleanWhy(parsed.why);
  const citedSources = sourcesFromCitations(raw, chunks);
  const sources =
    parsed.sources.length > 0
      ? parsed.sources
      : citedSources.length > 0
        ? citedSources
        : sourcesFromChunks(chunks);
  const practicalFix = parsed.practicalFix.trim() || 'None';

  return {
    ...parsed,
    why,
    sources,
    practicalFix,
  };
}

export function parseAskResponse(text: string): AskResult {
  return {
    answer: parseSection(text, 'Answer'),
    why: parseSection(text, 'Why'),
    sources: parseSources(text),
    practicalFix: parseSection(text, 'Practical fix'),
  };
}

export async function generateAnswer(
  system: string,
  user: string,
  config: AskConfig,
): Promise<string> {
  const response = await fetch(`${config.ollamaHost}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.ollamaModel,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama chat failed (${response.status}). Is Ollama running with ${config.ollamaModel}?`,
    );
  }

  const data = (await response.json()) as {
    message?: { content?: string };
  };

  const content = data.message?.content?.trim();
  if (!content) {
    throw new Error('Ollama returned an empty response.');
  }

  return content;
}
