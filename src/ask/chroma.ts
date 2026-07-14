import { CloudClient, type Collection } from 'chromadb';
import type { AskConfig } from './config';
import { externalEmbeddings } from './chroma-embedding';

export function createChromaClient(config: AskConfig): CloudClient {
  return new CloudClient({
    apiKey: config.chromaApiKey,
    tenant: config.chromaTenant,
    database: config.chromaDatabase,
    host: config.chromaHost,
  });
}

export async function getCollection(config: AskConfig): Promise<Collection> {
  const client = createChromaClient(config);
  return client.getOrCreateCollection({
    name: config.chromaCollection,
    embeddingFunction: externalEmbeddings,
  });
}
