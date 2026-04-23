import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import type { Impact, Issue, IssueNode, ScanResult } from './types';

// Map axe tags like "wcag143", "wcag21aa" into the human-friendly refs the
// assistant can cite (e.g. "WCAG 1.4.3", "WCAG 2.1 AA").
function parseWcagTags(tags: string[]): string[] {
  const refs = new Set<string>();
  for (const tag of tags) {
    const criterion = /^wcag(\d)(\d)(\d+)$/.exec(tag);
    if (criterion) {
      refs.add(`WCAG ${criterion[1]}.${criterion[2]}.${criterion[3]}`);
      continue;
    }
    const conformance = /^wcag(\d)(\d)(a+)$/.exec(tag);
    if (conformance) {
      refs.add(`WCAG ${conformance[1]}.${conformance[2]} ${conformance[3].toUpperCase()}`);
    }
  }
  return Array.from(refs);
}

export async function scanPage(url: string): Promise<ScanResult> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const axeResults = await new AxeBuilder({ page }).analyze();

    const images = await page.evaluate(() =>
      Array.from(document.images)
        .filter((img) => !img.alt)
        .map((img) => ({
          src: img.src,
          alt: img.alt || null,
          selector: img.id ? `#${img.id}` : `img[src="${img.src}"]`,
        })),
    );

    const issues: Issue[] = axeResults.violations.map((v) => {
      const nodes: IssueNode[] = v.nodes.map((n) => ({
        html: n.html,
        selector: (n.target[0] as string) ?? '',
        target: n.target.map(String),
      }));
      return {
        id: v.id,
        impact: (v.impact as Impact) ?? 'minor',
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        wcagTags: parseWcagTags(v.tags ?? []),
        html: nodes[0]?.html ?? '',
        selector: nodes[0]?.selector ?? '',
        nodes,
      };
    });

    return { url, issues, images };
  } finally {
    await context.close();
    await browser.close();
  }
}
