import { createHash } from 'node:crypto';
import { Glob } from 'bun';

const glob = new Glob('**/*.md');
const sourceRoot = 'data/sources';
const OLLAMA_EMBED_MODEL = 'nomic-embed-text';

function ollamaBaseUrl(): string {
  const host = process.env.OLLAMA_HOST ?? 'http://localhost:11434';
  if (host.startsWith('http://') || host.startsWith('https://')) {
    return host;
  }
  return `http://${host}`;
}

async function embedTexts(texts: string[]): Promise<number[][]> {
  const response = await fetch(`${ollamaBaseUrl()}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_EMBED_MODEL,
      input: texts,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama embed failed: ${response.status}`);
  }

  const data = (await response.json()) as { embeddings: number[][] };
  return data.embeddings;
}

type SourceMetadata = {
  source: string;
  topic: string;
  title: string;
  url: string;
  wcag_sc?: string;
};

function parseSourceFile(text: string): {
  metadata: SourceMetadata;
  body: string;
} {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    throw new Error('Missing frontmatter');
  }

  const [, rawFrontmatter, body] = match;
  const metadata = Object.fromEntries(
    rawFrontmatter
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [key, ...valueParts] = line.split(':');
        return [key.trim(), valueParts.join(':').trim()];
      }),
  ) as SourceMetadata;

  return {
    metadata,
    body: body.trim(),
  };
}

function stableChunkId(url: string, chunkIndex: number): string {
  return createHash('sha256').update(`${url}:${chunkIndex}`).digest('hex');
}

function chunkText(text: string, maxLength = 800): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = '';

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;

    if (next.length <= maxLength) {
      current = next;
      continue;
    }

    if (current) {
      chunks.push(current);
    }

    current = paragraph;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

for await (const relativePath of glob.scan(sourceRoot)) {
  const filePath = `${sourceRoot}/${relativePath}`;
  const text = await Bun.file(filePath).text();
  const { metadata, body } = parseSourceFile(text);
  const chunks = chunkText(body);
  const embeddings = await embedTexts(chunks);

  for (const [chunkIndex, chunk] of chunks.entries()) {
    const id = stableChunkId(metadata.url, chunkIndex);
    const embedding = embeddings[chunkIndex];
    console.log(
      id,
      metadata.title,
      `chunk ${chunkIndex}`,
      `${chunk.length} chars`,
      `${embedding.length} dims`,
    );
  }
}