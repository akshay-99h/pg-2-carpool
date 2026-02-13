import type * as React from 'react';

import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('space-y-4', className)} {...props} />;
}

export function Field({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('space-y-2', className)} {...props} />;
}

export function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label className={cn('text-sm font-medium', className)} {...props} />;
}

export function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-xs text-muted-foreground', className)} {...props} />;
}

export function FieldSeparator({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center gap-3 text-xs text-muted-foreground', className)}
      {...props}
    >
      <Separator className="flex-1" />
      {children ? (
        <span className="whitespace-nowrap font-medium uppercase tracking-[0.1em]">{children}</span>
      ) : null}
      <Separator className="flex-1" />
    </div>
  );
}
