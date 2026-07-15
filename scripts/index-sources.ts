import { createHash } from 'node:crypto';
import { CloudClient } from 'chromadb';
import { Glob } from 'bun';
import { externalEmbeddings } from '../src/ask/chroma-embedding';

const glob = new Glob('**/*.md');
const sourceRoot = 'data/sources';
const OLLAMA_EMBED_MODEL = 'nomic-embed-text';
const COLLECTION_NAME = 'brenda-a11y';

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

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Check your .env file.`);
  }
  return value;
}

function createChromaClient(): CloudClient {
  return new CloudClient({
    apiKey: requireEnv('CHROMA_API_KEY'),
    tenant: requireEnv('CHROMA_TENANT'),
    database: requireEnv('CHROMA_DATABASE'),
    host: process.env.CHROMA_HOST ?? 'api.trychroma.com',
  });
}

function toChunkMetadata(metadata: SourceMetadata, chunkIndex: number) {
  return {
    source: metadata.source,
    topic: metadata.topic,
    title: metadata.title,
    url: metadata.url,
    chunk_index: chunkIndex,
    ...(metadata.wcag_sc ? { wcag_sc: metadata.wcag_sc } : {}),
  };
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

const client = createChromaClient();
const collection = await client.getOrCreateCollection({
  name: COLLECTION_NAME,
  embeddingFunction: externalEmbeddings,
});

let totalUpserted = 0;

for await (const relativePath of glob.scan(sourceRoot)) {
  const filePath = `${sourceRoot}/${relativePath}`;
  const text = await Bun.file(filePath).text();
  const { metadata, body } = parseSourceFile(text);
  const chunks = chunkText(body);
  const embeddings = await embedTexts(chunks);

  const ids = chunks.map((_, chunkIndex) =>
    stableChunkId(metadata.url, chunkIndex),
  );
  const metadatas = chunks.map((_, chunkIndex) =>
    toChunkMetadata(metadata, chunkIndex),
  );

  await collection.upsert({
    ids,
    embeddings,
    documents: chunks,
    metadatas,
  });

  totalUpserted += chunks.length;
  console.log(`Upserted ${chunks.length} chunks for ${metadata.title}`);
}

const collectionCount = await collection.count();
console.log(
  `Done. ${totalUpserted} chunks upserted into ${COLLECTION_NAME}. Collection count: ${collectionCount}`,
);