import type { Impact, Issue, ScanResponse } from '../types';

const MAX_ISSUES = 20;
const MAX_SNIPPET_CHARS = 240;
const IMPACT_ORDER: Record<Impact, number> = { critical: 0, serious: 1, moderate: 2, minor: 3 };

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return `${s.slice(0, n - 1)}…`;
}

function rankIssues(issues: Issue[]): Issue[] {
  return [...issues].sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]);
}

export function buildScanContext(scan: ScanResponse | null): string {
  if (!scan) {
    return 'SCAN CONTEXT: No scan has been run yet in this session.';
  }

  const ranked = rankIssues(scan.issues).slice(0, MAX_ISSUES);

  const summary = [
    `URL: ${scan.url}`,
    `Scanned: ${scan.scannedAt}`,
    `Totals: ${scan.summary.totalIssues} issues, ${scan.summary.imagesMissingAlt} images missing alt.`,
    `By impact: critical=${scan.summary.byImpact.critical}, serious=${scan.summary.byImpact.serious}, moderate=${scan.summary.byImpact.moderate}, minor=${scan.summary.byImpact.minor}.`,
  ].join('\n');

  const body = ranked.length
    ? ranked
        .map((issue, i) => {
          const wcag = issue.wcagTags.length ? ` [${issue.wcagTags.join(', ')}]` : '';
          return [
            `#${i + 1} ${issue.id} (${issue.impact})${wcag} x${issue.nodes.length}`,
            `  help: ${issue.help}`,
            `  selector: ${issue.selector}`,
            `  snippet: ${truncate(issue.html.replace(/\s+/g, ' ').trim(), MAX_SNIPPET_CHARS)}`,
          ].join('\n');
        })
        .join('\n')
    : '(no axe violations reported)';

  return [
    'SCAN CONTEXT (the most recent scan in this session)',
    summary,
    '',
    `Top ${ranked.length} issues (ranked by impact):`,
    body,
    '',
    'Use the exact rule id (e.g. "color-contrast") when calling the get_issue_details tool.',
  ].join('\n');
}
