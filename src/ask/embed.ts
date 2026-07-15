import type { AskConfig } from './config';

export async function embedTexts(
  texts: string[],
  config: AskConfig,
): Promise<number[][]> {
  const response = await fetch(`${config.ollamaHost}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.ollamaEmbedModel,
      input: texts,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama embed failed (${response.status}). Is Ollama running? Try: ollama list`,
    );
  }

  const data = (await response.json()) as { embeddings: number[][] };
  return data.embeddings;
}

export async function embedText(
  text: string,
  config: AskConfig,
): Promise<number[]> {
  const [embedding] = await embedTexts([text], config);
  return embedding;
}
