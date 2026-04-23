'use client';

import * as React from 'react';
import { AlertCircle, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AssistantProvider } from '@/components/assistant/AssistantProvider';
import { AssistantTrigger } from '@/components/assistant/AssistantTrigger';
import { AssistantPanel } from '@/components/assistant/AssistantPanel';
import type { ScanResponse } from '@/lib/types';

export default function Home() {
  const [url, setUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<ScanResponse | null>(null);
  const [error, setError] = React.useState('');

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

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
              <Input
                id="scan-url"
                type="url"
                required
                inputMode="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="sm:flex-1"
              />
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
              <ResultsSummary results={results} />
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

function ResultsSummary({ results }: { results: ScanResponse }) {
  const { summary } = results;
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Summary
      </h2>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
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
  );
}

function ImageSuggestions({ results }: { results: ScanResponse }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Suggested alt text
      </h2>
      <ul className="flex flex-col gap-4">
        {results.images.map((img, i) => (
          <li key={i} className="flex flex-col gap-2 rounded-md border p-3">
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt=""
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
                {issue.wcagTags.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {issue.wcagTags.join(' · ')}
                  </span>
                )}
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
            </div>
          </li>
        ))}
      </ul>
    </div>
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
