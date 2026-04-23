import type { Impact, Issue } from './types';

export interface LinearTicket {
  title: string;
  description: string;
}

// User-facing impact blurb — written for a dev who owns the page and needs
// to understand *why this matters to their users*, not the axe impact tier.
// Generic per-level because axe doesn't expose this text; calibrated to
// match the WCAG conformance implications of each tier.
const IMPACT_BLURB: Record<Impact, string> = {
  critical:
    'Blocks users with disabilities from using core functionality. Screen-reader or keyboard-only users may be unable to complete the task on this page.',
  serious:
    'Significantly degrades the experience for users with disabilities. Interactions work but are confusing, mis-announced, or require workarounds.',
  moderate:
    'Creates friction for users with disabilities. Information is reachable but harder to parse or operate than it should be.',
  minor:
    'A small accessibility issue — worth fixing, but unlikely to block or confuse users on its own.',
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
// of the pasted description.
export function formatLinearTicket(
  issue: Issue,
  scanUrl: string,
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
