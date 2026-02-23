import { type VariantProps, cva } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border text-xs font-semibold tracking-[0.01em] transition-colors',
  {
    variants: {
      variant: {
        default: 'border-primary/25 bg-primary/10 text-primary',
        secondary: 'border-slate-300 bg-slate-100 text-slate-700',
        outline: 'border-border/80 bg-white text-foreground/85',
        success: 'border-emerald-300 bg-emerald-50 text-emerald-800',
        warning: 'border-amber-300 bg-amber-50 text-amber-900',
        danger: 'border-rose-300 bg-rose-50 text-rose-800',
      },
      size: {
        default: 'px-2.5 py-1',
        sm: 'px-2 py-0.5 text-[0.65rem]',
        dot: 'h-2 w-2 border-0 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
