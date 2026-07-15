import './chroma-embedding';
import { loadAskConfig } from './config';
import { retrieveChunks } from './retrieve';
import { buildPrompt } from './prompt';
import { generateAnswer, parseAskResponse, finalizeAskResult } from './answer';
import type { AskResult } from './types';

export type { AskResult, AskSource, ChunkMetadata, RetrievedChunk } from './types';
export { loadAskConfig } from './config';
export { buildPrompt } from './prompt';
export { parseAskResponse } from './answer';

export async function askQuestion(question: string): Promise<AskResult> {
  const config = loadAskConfig();
  const chunks = await retrieveChunks(question, config);

  if (chunks.length === 0) {
    return {
      answer: 'Insufficient sources to answer this question.',
      why: 'No relevant documentation chunks were retrieved from Chroma.',
      sources: [],
      practicalFix: 'None',
    };
  }

  const { system, user } = buildPrompt(question, chunks);
  const raw = await generateAnswer(system, user, config);
  return finalizeAskResult(parseAskResponse(raw), raw, chunks);
}
