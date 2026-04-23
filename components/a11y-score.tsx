import * as React from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, Minus, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { A11yScore } from '@/lib/score';

const RADIUS = 52;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const RING_CLASS: Record<A11yScore['band'], string> = {
  good: 'text-emerald-600',
  'needs-improvement': 'text-amber-600',
  poor: 'text-red-600',
};

const LABEL_CLASS: Record<A11yScore['band'], string> = {
  good: 'text-emerald-700',
  'needs-improvement': 'text-amber-700',
  poor: 'text-red-700',
};

const ICON: Record<A11yScore['band'], React.ComponentType<{ className?: string }>> = {
  good: CheckCircle2,
  'needs-improvement': AlertTriangle,
  poor: XCircle,
};

interface Props {
  score: A11yScore;
  previous?: number | null;
  className?: string;
}

export function A11yScoreRing({ score, previous, className }: Props) {
  const offset = CIRCUMFERENCE - (score.value / 100) * CIRCUMFERENCE;
  const Icon = ICON[score.band];
  const delta = previous != null ? score.value - previous : null;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative">
        <svg
          viewBox="0 0 120 120"
          className="size-28"
          role="img"
          aria-label={
            delta != null
              ? `Accessibility score ${score.value} out of 100, ${score.label}, ${
                  delta > 0 ? 'up' : delta < 0 ? 'down' : 'unchanged'
                } ${Math.abs(delta)} from last scan`
              : `Accessibility score ${score.value} out of 100, ${score.label}`
          }
        >
          {/* Track */}
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-muted"
          />
          {/* Progress arc */}
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            className={cn('transition-[stroke-dashoffset] duration-500', RING_CLASS[score.band])}
          />
          {/* Score number */}
          <text
            x="60"
            y="66"
            textAnchor="middle"
            className="fill-foreground text-[26px] font-semibold tabular-nums"
          >
            {score.value}
          </text>
        </svg>
      </div>
      <div className={cn('flex items-center gap-1.5 text-xs font-medium', LABEL_CLASS[score.band])}>
        <Icon className="size-3.5" aria-hidden="true" />
        <span>{score.label}</span>
      </div>
      {delta != null && (
        <div
          className={cn(
            'flex items-center gap-1 text-[11px] tabular-nums',
            delta > 0
              ? 'text-emerald-700'
              : delta < 0
                ? 'text-red-700'
                : 'text-muted-foreground',
          )}
          aria-hidden="true"
        >
          {delta > 0 ? (
            <ArrowUp className="size-3" />
          ) : delta < 0 ? (
            <ArrowDown className="size-3" />
          ) : (
            <Minus className="size-3" />
          )}
          <span>
            {delta === 0 ? 'No change' : `${Math.abs(delta)} from last scan`}
          </span>
        </div>
      )}
    </div>
  );
}
