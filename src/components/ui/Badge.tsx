import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow',
        outline: 'text-foreground border-border',
        low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 dark:text-emerald-400',
        moderate: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400',
        high: 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400',
        severe: 'bg-red-500/15 text-red-600 border-red-500/40 dark:text-red-400 animate-pulse-subtle',
        radar: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30 dark:text-cyan-400',
        operational: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 dark:text-emerald-400',
        standby: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400',
        awaiting: 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:text-slate-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'severe' && 'bg-red-400 animate-beacon',
            variant === 'high' && 'bg-orange-400',
            variant === 'moderate' && 'bg-amber-400',
            variant === 'low' && 'bg-emerald-400',
            variant === 'operational' && 'bg-emerald-400 animate-pulse',
            variant === 'standby' && 'bg-amber-400',
            variant === 'awaiting' && 'bg-slate-400',
            variant === 'radar' && 'bg-cyan-400',
            !variant && 'bg-primary'
          )}
        />
      )}
      {children}
    </div>
  );
}
