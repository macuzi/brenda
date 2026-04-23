import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        critical: 'border-transparent bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-50',
        serious:
          'border-transparent bg-orange-50 text-orange-900 dark:bg-orange-950 dark:text-orange-50',
        moderate:
          'border-transparent bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-50',
        minor:
          'border-transparent bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-50',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
