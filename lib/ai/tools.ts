import type Anthropic from '@anthropic-ai/sdk';
import type { ScanResponse } from '../types';

export const getIssueDetailsTool: Anthropic.Tool = {
  name: 'get_issue_details',
  description:
    'Retrieve the full details for a specific accessibility issue from the current scan. Returns every occurrence (all DOM nodes), the full HTML snippet for each, WCAG references, and the axe help URL. Use this when the user asks about a specific issue and the short snippet in the context is not enough.',
  input_schema: {
    type: 'object',
    properties: {
      rule_id: {
        type: 'string',
        description:
          'The axe rule id as shown in the scan context (e.g. "color-contrast", "image-alt", "label").',
      },
    },
    required: ['rule_id'],
  },
};

export function runGetIssueDetails(scan: ScanResponse | null, ruleId: string): string {
  if (!scan) {
    return JSON.stringify({ error: 'No scan has been run yet.' });
  }
  const issue = scan.issues.find((i) => i.id === ruleId);
  if (!issue) {
    return JSON.stringify({
      error: `No issue with rule_id "${ruleId}" found in the current scan.`,
      availableRuleIds: scan.issues.map((i) => i.id),
    });
  }
  return JSON.stringify({
    ruleId: issue.id,
    impact: issue.impact,
    description: issue.description,
    help: issue.help,
    helpUrl: issue.helpUrl,
    wcagTags: issue.wcagTags,
    occurrences: issue.nodes.map((n) => ({
      selector: n.selector,
      target: n.target,
      html: n.html,
    })),
  });
}
