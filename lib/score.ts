import type { ScanResponse } from './types';

export type ScoreBand = 'good' | 'needs-improvement' | 'poor';

export interface A11yScore {
  value: number; // 0–100
  band: ScoreBand;
  label: string;
}

// Impact weights roughly follow Lighthouse's intent: one critical issue is ~5x
// worse than one minor. Missing-alt is penalised separately per unique image,
// capped so a heavily decorative site doesn't zero out on a single bad cluster.
const IMPACT_PENALTY: Record<string, number> = {
  critical: 15,
  serious: 10,
  moderate: 5,
  minor: 2,
};
const MISSING_ALT_PENALTY = 3;
const MISSING_ALT_PENALTY_CAP = 30;

export function calculateScore(scan: ScanResponse): A11yScore {
  let value = 100;
  for (const issue of scan.issues) {
    value -= IMPACT_PENALTY[issue.impact] ?? 2;
  }
  value -= Math.min(MISSING_ALT_PENALTY_CAP, scan.summary.imagesMissingAlt * MISSING_ALT_PENALTY);
  value = Math.max(0, Math.min(100, value));

  const band: ScoreBand = value >= 90 ? 'good' : value >= 50 ? 'needs-improvement' : 'poor';
  const label =
    band === 'good' ? 'Good' : band === 'needs-improvement' ? 'Needs improvement' : 'Poor';
  return { value, band, label };
}
