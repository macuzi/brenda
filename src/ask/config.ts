export type AskConfig = {
  chromaApiKey: string;
  chromaTenant: string;
  chromaDatabase: string;
  chromaHost: string;
  chromaCollection: string;
  ollamaHost: string;
  ollamaModel: string;
  ollamaEmbedModel: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and fill in your Chroma and Ollama settings.`,
    );
  }
  return value;
}

function ollamaBaseUrl(): string {
  const host = process.env.OLLAMA_HOST ?? 'http://localhost:11434';
  if (host.startsWith('http://') || host.startsWith('https://')) {
    return host;
  }
  return `http://${host}`;
}

export function loadAskConfig(): AskConfig {
  return {
    chromaApiKey: requireEnv('CHROMA_API_KEY'),
    chromaTenant: requireEnv('CHROMA_TENANT'),
    chromaDatabase: requireEnv('CHROMA_DATABASE'),
    chromaHost: process.env.CHROMA_HOST ?? 'api.trychroma.com',
    chromaCollection: process.env.CHROMA_COLLECTION ?? 'brenda-a11y',
    ollamaHost: ollamaBaseUrl(),
    ollamaModel: process.env.OLLAMA_MODEL ?? 'llama3.2',
    ollamaEmbedModel: process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text',
  };
}
