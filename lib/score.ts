import type { Impact, ScanResponse } from './types';

export type ScoreBand = 'good' | 'needs-improvement' | 'poor';

export interface A11yScore {
  value: number; // 0–100
  band: ScoreBand;
  label: string;
}

// Bump the key whenever the scoring formula changes so old cached scores
// don't produce nonsense trend arrows on the first post-change scan.
const HISTORY_KEY = 'brenda.lastScan.v2';

export interface LastScan {
  url: string;
  scannedAt: string;
  score: number;
}

export function loadLastScan(): LastScan | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastScan;
    if (
      typeof parsed?.url === 'string' &&
      typeof parsed?.scannedAt === 'string' &&
      typeof parsed?.score === 'number'
    ) {
      return parsed;
    }
  } catch {
    // fall through
  }
  return null;
}

export function saveLastScan(entry: LastScan): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(entry));
  } catch {
    // quota / private mode — silent fail is fine
  }
}

// Lighthouse-style weighted-binary scoring. Each axe rule is a binary
// pass/fail (an ARIA rule failing on 13 buttons counts the same as failing
// on one — what matters is "is this audit failing at all"). Rules are
// weighted by the user-impact they would have if failed. Weights mirror
// the impact tiers Lighthouse documents at
// developer.chrome.com/docs/lighthouse/accessibility/scoring.
//
//   score = passed_weight / (passed_weight + failed_weight) * 100
//
// This produces scores comparable to Lighthouse's accessibility category
// for the same page, and it's stable under duplication (a component
// rendered 50× with one bad label no longer tanks the score 50×).
const IMPACT_WEIGHT: Record<Impact, number> = {
  critical: 10,
  serious: 7,
  moderate: 3,
  minor: 1,
};

function weightOf(impact: Impact | undefined, fallback: Impact): number {
  return IMPACT_WEIGHT[impact ?? fallback];
}

export function calculateScore(scan: ScanResponse): A11yScore {
  const failedWeight = scan.issues.reduce(
    (sum, issue) => sum + weightOf(issue.impact, 'minor'),
    0,
  );
  const passedWeight = scan.passes.reduce(
    (sum, rule) => sum + weightOf(rule.impact, 'moderate'),
    0,
  );
  const totalWeight = failedWeight + passedWeight;

  // No applicable rules = nothing measurable failed. Treat as 100 rather
  // than 0/0; this only happens on pages axe can't evaluate at all.
  const value =
    totalWeight === 0 ? 100 : Math.round((passedWeight / totalWeight) * 100);

  const band: ScoreBand = value >= 90 ? 'good' : value >= 50 ? 'needs-improvement' : 'poor';
  const label =
    band === 'good' ? 'Good' : band === 'needs-improvement' ? 'Needs improvement' : 'Poor';
  return { value, band, label };
}
