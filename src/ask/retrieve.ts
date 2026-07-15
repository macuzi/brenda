import type { AskConfig } from './config';
import { embedText } from './embed';
import { getCollection } from './chroma';
import type { ChunkMetadata, RetrievedChunk } from './types';

function toChunkMetadata(metadata: Record<string, unknown>): ChunkMetadata {
  return {
    source: String(metadata.source ?? ''),
    topic: String(metadata.topic ?? ''),
    title: String(metadata.title ?? ''),
    url: String(metadata.url ?? ''),
    chunk_index: Number(metadata.chunk_index ?? 0),
    ...(metadata.wcag_sc ? { wcag_sc: String(metadata.wcag_sc) } : {}),
  };
}

export async function retrieveChunks(
  question: string,
  config: AskConfig,
  topK = 5,
): Promise<RetrievedChunk[]> {
  const collection = await getCollection(config);
  const count = await collection.count();

  if (count === 0) {
    throw new Error(
      'Chroma collection is empty. Run `bun run index:sources` first.',
    );
  }

  const queryEmbedding = await embedText(question, config);
  const result = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
    include: ['documents', 'metadatas', 'distances'],
  });

  const rows = result.rows()[0] ?? [];

  return rows
    .filter((row) => row.document && row.metadata)
    .map((row) => ({
      id: row.id,
      document: row.document!,
      metadata: toChunkMetadata(row.metadata as Record<string, unknown>),
      distance: row.distance ?? 0,
    }));
}
