export type Impact = 'critical' | 'serious' | 'moderate' | 'minor';

export interface IssueNode {
  html: string;
  selector: string;
  target: string[];
}

export interface Issue {
  id: string;
  impact: Impact;
  description: string;
  help: string;
  helpUrl: string;
  wcagTags: string[];
  html: string;
  selector: string;
  nodes: IssueNode[];
}

export interface ImageMissingAlt {
  src: string;
  alt: string | null;
  selector: string;
}

export interface ImageWithFix extends ImageMissingAlt {
  suggestedAlt: string;
  fix: {
    before: string;
    after: string;
  };
}

export interface ScanResult {
  url: string;
  issues: Issue[];
  images: ImageMissingAlt[];
}

export interface ScanResponse {
  url: string;
  scannedAt: string;
  summary: {
    totalIssues: number;
    imagesMissingAlt: number;
    byImpact: Record<Impact, number>;
  };
  issues: Issue[];
  images: ImageWithFix[];
}

export interface ScanError {
  error: string;
  details?: string;
}

// -----------------------------------------------------------------------------
// Assistant chat
// -----------------------------------------------------------------------------

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  scan: ScanResponse | null;
}

export type ChatStreamEvent =
  | { type: 'token'; delta: string }
  | { type: 'tool_use'; name: string; input: unknown }
  | { type: 'tool_result'; name: string; ok: boolean }
  | { type: 'done' }
  | { type: 'error'; code: ChatErrorCode; message: string; retryable: boolean };

export type ChatErrorCode =
  | 'rate_limit'
  | 'overloaded'
  | 'auth'
  | 'bad_request'
  | 'network'
  | 'unknown';
