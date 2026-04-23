import type { Issue } from './types';

export interface LinearTicket {
  title: string;
  description: string;
}

// Formats an accessibility issue as a structured Linear ticket: title and
// description are kept separate to match Linear's data shape (two fields
// in the "Create Issue" modal), so the title doesn't need to be cut out
// of the pasted description.
export function formatLinearTicket(
  issue: Issue,
  scanUrl: string,
  scannedAt: string,
): LinearTicket {
  const occurrences = issue.nodes.length;
  const occurrenceLabel = `${occurrences} element${occurrences === 1 ? '' : 's'}`;
  const instanceSuffix = occurrences > 1 ? ` (${occurrences} instances)` : '';
  const title = `[a11y · ${issue.impact}] ${issue.help}${instanceSuffix}`;

  const sampleHtml = issue.nodes[0]?.html ?? '';
  const wcagLine = issue.wcagTags.length
    ? ` · **WCAG:** ${issue.wcagTags
        .map((tag) => `[${tag}](${issue.helpUrl})`)
        .join(', ')}`
    : '';
  const date = new Date(scannedAt).toISOString().slice(0, 10);

  const description = [
    `${issue.description}. Failing on ${occurrenceLabel} on ${scanUrl}.`,
    '',
    `**Rule:** \`${issue.id}\`${wcagLine}`,
    '',
    'Sample failing element:',
    '```html',
    sampleHtml,
    '```',
    '',
    `[Fix guide →](${issue.helpUrl})`,
    '',
    '---',
    `Scanned ${date}`,
  ].join('\n');

  return { title, description };
}

// Opens Linear's "Create Issue" modal pre-filled with the ticket. If the
// user is signed into Linear, their workspace/team modal appears with
// title + description ready to submit — no copy-paste required.
// Length-capped at ~6000 chars to stay safely under browser URL limits.
export function linearNewIssueUrl(ticket: LinearTicket): string {
  const params = new URLSearchParams({
    title: ticket.title.slice(0, 200),
    description: ticket.description.slice(0, 5500),
  });
  return `https://linear.app/new?${params.toString()}`;
}

// Single-string clipboard fallback for when the URL flow isn't an option
// (no Linear account, offline, paste into another tool, etc.). Puts the
// title as an H1 on top of the description so a paste into any markdown
// surface reads cleanly.
export function ticketAsMarkdown(ticket: LinearTicket): string {
  return `# ${ticket.title}\n\n${ticket.description}`;
}
