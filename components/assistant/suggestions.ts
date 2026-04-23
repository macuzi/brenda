import type { ScanResponse } from '@/lib/types';

export interface Suggestion {
  label: string;
  prompt: string;
}

export function suggestionsFor(scan: ScanResponse | null): Suggestion[] {
  if (!scan) {
    return [
      { label: 'How do I run my first scan?', prompt: 'How do I run my first scan with brenda?' },
      { label: 'What is WCAG 2.2?', prompt: 'What is WCAG 2.2 and what changed vs 2.1?' },
      {
        label: 'Difference between A, AA, and AAA?',
        prompt: 'What is the difference between WCAG conformance levels A, AA, and AAA?',
      },
    ];
  }

  if (scan.summary.totalIssues === 0) {
    return [
      {
        label: 'How do I test with a screen reader?',
        prompt: 'How should I test this site with a screen reader? Which one do you recommend?',
      },
      {
        label: 'What does brenda not catch?',
        prompt:
          "brenda gave me a clean scan — what accessibility issues can automated tools like this NOT catch that I should test manually?",
      },
    ];
  }

  const top = scan.issues[0];
  return [
    { label: 'Explain my top issue', prompt: `Explain my top issue (${top?.id}) in plain terms.` },
    {
      label: 'Which issues should I fix first?',
      prompt: 'Given my scan results, which issues should I fix first and why?',
    },
    {
      label: `Show me a fix for "${top?.id ?? 'the top issue'}"`,
      prompt: `Show me a concrete fix for the "${top?.id}" issue, with before/after code.`,
    },
  ];
}
