export type ChunkMetadata = {
  source: string;
  topic: string;
  title: string;
  url: string;
  chunk_index: number;
  wcag_sc?: string;
};

export type RetrievedChunk = {
  id: string;
  document: string;
  metadata: ChunkMetadata;
  distance: number;
};

export type AskSource = {
  title: string;
  url: string;
  wcag_sc?: string;
};

export type AskResult = {
  answer: string;
  why: string;
  sources: AskSource[];
  practicalFix: string;
};
