import type { Impact, Issue } from './types';

export interface LinearTicket {
  title: string;
  description: string;
}

export interface FixSuggestion {
  fixedHtml: string;
  why: string;
}

// Plain-English impact blurbs aimed at non-devs (designers, PMs, QA) who
// might be the first to read the ticket. Avoids jargon like "ARIA",
// "semantic HTML", "assistive technology"; uses everyday phrases like
// "have the page read aloud" and "without a mouse". One sentence each.
const IMPACT_BLURB: Record<Impact, string> = {
  critical:
    "Some people won't be able to use this part of the page at all — for example, anyone who navigates without a mouse or has the page read aloud to them.",
  serious:
    "People who browse without sight or without a mouse can reach this part of the page, but it's confusing or missing information they rely on.",
  moderate:
    'This part of the page is harder to use than it needs to be for people who navigate with a keyboard or have the page read aloud.',
  minor:
    "A small rough edge. Most people won't notice, but worth fixing when convenient.",
};

// Prefix every line with "> " so multi-line axe output renders as a single
// markdown blockquote. axe's failureSummary is usually 2–5 lines
// ("Fix all of the following:\n  ARIA attribute is not allowed: ...").
function asBlockquote(text: string): string {
  return text
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}

// Formats an accessibility issue as a structured Linear ticket: title and
// description are kept separate to match Linear's data shape (two fields
// in the "Create Issue" modal), so the title doesn't need to be cut out
// of the pasted description. When a fix suggestion is provided, inserts
// an "Example fix" + "Why this helps" block right under the failing
// element so the reader has a concrete patch in-ticket.
export function formatLinearTicket(
  issue: Issue,
  scanUrl: string,
  suggestion?: FixSuggestion,
): LinearTicket {
  const occurrences = issue.nodes.length;
  const elementLabel = `${occurrences} element${occurrences === 1 ? '' : 's'}`;
  const instanceSuffix = occurrences > 1 ? ` (${occurrences} instances)` : '';
  const title = `[a11y · ${issue.impact}] ${issue.help}${instanceSuffix}`;

  const sampleHtml = issue.nodes[0]?.html ?? '';
  const failureSummary = issue.nodes[0]?.failureSummary?.trim();
  const wcagLine = issue.wcagTags.length
    ? issue.wcagTags.map((tag) => `[${tag}](${issue.helpUrl})`).join(', ')
    : null;

  const lines: string[] = [
    `On \`${scanUrl}\`, **${elementLabel}** fail \`${issue.id}\` — ${issue.description}.`,
    '',
    `**Impact (${issue.impact}):** ${IMPACT_BLURB[issue.impact]}`,
    '',
  ];

  if (wcagLine) {
    lines.push(`**WCAG:** ${wcagLine}`, '');
  }

  lines.push('**Sample failing element:**', '```html', sampleHtml, '```', '');

  if (suggestion) {
    lines.push(
      '**Example fix:**',
      '```html',
      suggestion.fixedHtml,
      '```',
      '',
      `**Why this helps:** ${suggestion.why}`,
      '',
    );
  }

  if (failureSummary) {
    lines.push('**What axe found:**', asBlockquote(failureSummary), '');
  }

  lines.push(`[Fix guide →](${issue.helpUrl})`);

  return { title, description: lines.join('\n') };
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
