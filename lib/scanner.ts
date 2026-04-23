import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import type { Impact, Issue, IssueNode, PassedRule, ScanResult } from './types';

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

    // Only flag images with NO alt attribute at all. `alt=""` is WCAG-correct
    // for decorative images (screen readers skip them) and must not be
    // treated as a missing-alt issue. Dedupe by src so identical images
    // reused across the page only produce one suggestion.
    const images = await page.evaluate(() => {
      const seen = new Set<string>();
      const out: { src: string; alt: string | null; selector: string }[] = [];
      for (const img of Array.from(document.images)) {
        if (img.getAttribute('alt') !== null) continue;
        if (seen.has(img.src)) continue;
        seen.add(img.src);
        out.push({
          src: img.src,
          alt: null,
          selector: img.id ? `#${img.id}` : `img[src="${img.src}"]`,
        });
      }
      return out;
    });

    const issues: Issue[] = axeResults.violations.map((v) => {
      const nodes: IssueNode[] = v.nodes.map((n) => ({
        html: n.html,
        selector: (n.target[0] as string) ?? '',
        target: n.target.map(String),
        failureSummary: n.failureSummary,
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

    // Passed rules feed the Lighthouse-style score's denominator. We only
    // need id + impact (no nodes) — the score formula weights each rule by
    // the impact it *would* have had if it failed. Axe sometimes leaves
    // impact null on passes; default to moderate so the rule still counts.
    const passes: PassedRule[] = axeResults.passes.map((p) => ({
      id: p.id,
      impact: (p.impact as Impact) ?? 'moderate',
    }));

    return { url, issues, images, passes };
  } finally {
    await context.close();
    await browser.close();
  }
}
