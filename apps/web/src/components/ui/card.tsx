import type * as React from 'react';

import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('border-t border-border/80 text-card-foreground', className)} {...props} />
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 pb-4 pt-5', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 className={cn('font-heading text-lg font-semibold', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-sm leading-relaxed text-muted-foreground', className)} {...props} />
  );
}

export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('pb-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center pb-5', className)} {...props} />;
}
