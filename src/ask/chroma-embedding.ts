import {
  registerEmbeddingFunction,
  type EmbeddingFunction,
  type EmbeddingFunctionClass,
} from 'chromadb';

export const externalEmbeddings: EmbeddingFunction = {
  name: 'brenda-external',
  async generate() {
    throw new Error(
      'Brenda supplies embeddings via Ollama. Pass queryEmbeddings or embeddings explicitly.',
    );
  },
};

class BrendaExternalEmbeddingClass {
  static name = 'default-embed';

  static buildFromConfig(): EmbeddingFunction {
    return externalEmbeddings;
  }
}

registerEmbeddingFunction(
  'default-embed',
  BrendaExternalEmbeddingClass as unknown as EmbeddingFunctionClass,
);

let warnPatched = false;

function suppressDefaultEmbedWarnings() {
  if (warnPatched) {
    return;
  }

  warnPatched = true;
  const originalWarn = console.warn;

  console.warn = (...args: unknown[]) => {
    const message = String(args[0] ?? '');
    if (message.includes('DefaultEmbeddingFunction')) {
      return;
    }

    originalWarn(...args);
  };
}

suppressDefaultEmbedWarnings();
