import * as React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
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
  className?: string;
}

export function A11yScoreRing({ score, className }: Props) {
  const offset = CIRCUMFERENCE - (score.value / 100) * CIRCUMFERENCE;
  const Icon = ICON[score.band];

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative">
        <svg
          viewBox="0 0 120 120"
          className="size-28"
          role="img"
          aria-label={`Accessibility score ${score.value} out of 100, ${score.label}`}
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
    </div>
  );
}
