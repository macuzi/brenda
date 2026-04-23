'use client';

import * as React from 'react';
import { AlertCircle, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { A11yScoreRing } from '@/components/a11y-score';
import { AssistantProvider } from '@/components/assistant/AssistantProvider';
import { AssistantTrigger } from '@/components/assistant/AssistantTrigger';
import { AssistantPanel } from '@/components/assistant/AssistantPanel';
import { useKeyboardShortcut } from '@/components/assistant/useKeyboardShortcut';
import { calculateScore, loadLastScan, saveLastScan } from '@/lib/score';
import {
  formatLinearTicket,
  linearNewIssueUrl,
  ticketAsMarkdown,
  type FixSuggestion,
} from '@/lib/linear-ticket';
import type { Issue, ScanResponse } from '@/lib/types';

export default function Home() {
  const [url, setUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<ScanResponse | null>(null);
  const [previousScore, setPreviousScore] = React.useState<number | null>(null);
  const [error, setError] = React.useState('');
  const urlInputRef = React.useRef<HTMLInputElement>(null);

  // "/" focuses and selects the URL input from anywhere on the page,
  // mirroring the GitHub/Slack/docs convention. skipWhenTyping prevents
  // the shortcut from hijacking "/" when the user is already typing in
  // another input (URL field, assistant composer, etc.).
  useKeyboardShortcut(
    { key: '/', meta: false, skipWhenTyping: true, preventDefault: true },
    () => {
      urlInputRef.current?.focus();
      urlInputRef.current?.select();
    },
  );

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);
    setPreviousScore(null);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Scan failed: ${res.status}`);
      }
      const data: ScanResponse = await res.json();
      const score = calculateScore(data).value;

      // If we have a cached scan for the same URL, show the trend.
      const cached = loadLastScan();
      if (cached && cached.url === data.url) {
        setPreviousScore(cached.score);
      }
      saveLastScan({ url: data.url, scannedAt: data.scannedAt, score });

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AssistantProvider scan={results}>
      <div className="min-h-dvh bg-background">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium tracking-tight text-foreground">brenda</span>
              <span className="text-xs text-muted-foreground">accessibility scanner</span>
            </div>
            <AssistantTrigger />
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-10">
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Scan a page
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Enter a public URL. brenda runs axe-core against the rendered page and
                surfaces WCAG violations, ARIA misuse, and images missing alt text — then
                generates suggested fixes.
              </p>
            </div>

            <form onSubmit={handleScan} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="scan-url" className="sr-only">
                URL to scan
              </label>
              <div className="relative sm:flex-1">
                <Input
                  id="scan-url"
                  ref={urlInputRef}
                  type="url"
                  required
                  inputMode="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="pr-10"
                />
                {!url && !loading && (
                  <kbd
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex"
                  >
                    /
                  </kbd>
                )}
              </div>
              <Button type="submit" disabled={loading || !url} className="sm:w-28">
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    <span className="sr-only">Scanning</span>
                  </>
                ) : (
                  'Scan'
                )}
              </Button>
            </form>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm"
              >
                <AlertCircle
                  className="mt-0.5 size-4 text-destructive"
                  aria-hidden="true"
                />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}
          </section>

          {results && (
            <section className="mt-12 flex flex-col gap-8" aria-label="Scan results">
              <ResultsSummary results={results} previousScore={previousScore} />
              {results.images.length > 0 && <ImageSuggestions results={results} />}
              {results.issues.length > 0 && <IssuesList results={results} />}
            </section>
          )}
        </main>

        <AssistantPanel />
      </div>
    </AssistantProvider>
  );
}

function ResultsSummary({
  results,
  previousScore,
}: {
  results: ScanResponse;
  previousScore: number | null;
}) {
  const { summary } = results;
  const score = React.useMemo(() => calculateScore(results), [results]);
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Summary
      </h2>
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
        <A11yScoreRing score={score} previous={previousScore} />
        <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Total issues</dt>
            <dd className="text-xl font-semibold tabular-nums">{summary.totalIssues}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Missing alt</dt>
            <dd className="text-xl font-semibold tabular-nums">{summary.imagesMissingAlt}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Critical</dt>
            <dd className="text-xl font-semibold tabular-nums">{summary.byImpact.critical}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Serious</dt>
            <dd className="text-xl font-semibold tabular-nums">{summary.byImpact.serious}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function ImageSuggestions({ results }: { results: ScanResponse }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Suggested alt text
      </h2>
      <ul className="flex flex-col gap-4">
        {results.images.map((img) => (
          <li key={img.src} className="flex flex-col gap-2 rounded-md border p-3">
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt=""
                loading="lazy"
                className="size-16 shrink-0 rounded border bg-muted object-cover"
              />
              <p className="text-sm leading-relaxed text-foreground">
                <span className="text-muted-foreground">Suggested:</span>{' '}
                {img.suggestedAlt}
              </p>
            </div>
            <CopyableCode code={img.fix.after} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function IssuesList({ results }: { results: ScanResponse }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Issues
      </h2>
      <ul className="flex flex-col">
        {results.issues.map((issue, i) => (
          <li key={issue.id + i} className="py-3">
            {i > 0 && <Separator className="mb-3" />}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={issue.impact}>{issue.impact}</Badge>
                <code className="font-mono text-xs text-muted-foreground">{issue.id}</code>
                {issue.wcagTags.map((tag) => (
                  <a
                    key={tag}
                    href={issue.helpUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {tag}
                  </a>
                ))}
              </div>
              <p className="text-sm leading-relaxed">{issue.help}</p>
              {issue.nodes[0] && (
                <CopyableCode code={issue.nodes[0].html} truncate />
              )}
              {issue.nodes.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  +{issue.nodes.length - 1} more occurrence
                  {issue.nodes.length - 1 === 1 ? '' : 's'}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={issue.helpUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-xs text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Learn how to fix this
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
                <TicketActions issue={issue} scanUrl={results.url} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Two sibling actions so neither surprises the user: Copy dumps the full
// ticket as markdown to the clipboard (works everywhere — paste into any
// issue tracker, Slack, a doc), Open in Linear opens Linear's Create Issue
// modal pre-filled with title + description via URL params (convenient when
// the user is actually signed into Linear).
//
// Both actions lazily fetch an AI-generated fix suggestion on first click
// (cached per component instance via suggestionRef, so Copy-then-Open only
// pays for one API call). If the fetch fails, we fall back to the
// suggestion-less template — the ticket is still useful, just without the
// "Example fix" block.
function TicketActions({
  issue,
  scanUrl,
}: {
  issue: Issue;
  scanUrl: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const suggestionRef = React.useRef<Promise<FixSuggestion | null> | null>(null);

  const getSuggestion = React.useCallback((): Promise<FixSuggestion | null> => {
    if (suggestionRef.current) return suggestionRef.current;
    suggestionRef.current = (async () => {
      try {
        const res = await fetch('/api/suggest-fix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ issue, scanUrl }),
        });
        if (!res.ok) return null;
        return (await res.json()) as FixSuggestion;
      } catch {
        return null;
      }
    })();
    return suggestionRef.current;
  }, [issue, scanUrl]);

  const onCopy = async () => {
    setLoading(true);
    const suggestion = await getSuggestion();
    const ticket = formatLinearTicket(issue, scanUrl, suggestion ?? undefined);
    try {
      await navigator.clipboard.writeText(ticketAsMarkdown(ticket));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (insecure context, permissions). Nothing graceful
      // to do here — the "Open in Linear" button next to this one is the
      // escape hatch.
    } finally {
      setLoading(false);
    }
  };

  // Pre-open a blank tab synchronously so the popup blocker sees a real
  // user gesture, then navigate it to the final Linear URL once the
  // suggestion fetch resolves. Falls back to a plain window.open if the
  // browser refuses the blank-tab handoff.
  const onOpenLinear = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const newTab = window.open('about:blank', '_blank', 'noopener,noreferrer');
    setLoading(true);
    void getSuggestion().then((suggestion) => {
      const ticket = formatLinearTicket(issue, scanUrl, suggestion ?? undefined);
      const url = linearNewIssueUrl(ticket);
      if (newTab && !newTab.closed) newTab.location.href = url;
      else window.open(url, '_blank', 'noopener,noreferrer');
      setLoading(false);
    });
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onCopy}
        disabled={loading}
        aria-label={copied ? 'Ticket copied' : 'Copy ticket as markdown'}
        className="h-7 gap-1.5 px-2 text-xs"
      >
        {loading ? (
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        ) : (
          <Copy className="size-3" aria-hidden="true" />
        )}
        {loading ? 'Preparing…' : copied ? 'Copied' : 'Copy ticket'}
      </Button>
      <a
        href="#"
        onClick={onOpenLinear}
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        aria-label="Open prefilled ticket in Linear"
        aria-disabled={loading}
      >
        <ExternalLink className="size-3" aria-hidden="true" />
        Open in Linear
      </a>
    </>
  );
}

function CopyableCode({ code, truncate }: { code: string; truncate?: boolean }) {
  const [copied, setCopied] = React.useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silent fail is fine here
    }
  };
  return (
    <div className="relative">
      <pre
        className={
          'overflow-x-auto rounded-md border bg-muted p-3 pr-20 font-mono text-xs leading-relaxed' +
          (truncate ? ' max-h-32' : '')
        }
      >
        <code>{code}</code>
      </pre>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onCopy}
        aria-label={copied ? 'Copied' : 'Copy code'}
        className="absolute right-2 top-2 h-7 gap-1 px-2 text-[11px]"
      >
        <Copy className="size-3" aria-hidden="true" />
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}
