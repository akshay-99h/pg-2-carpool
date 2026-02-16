'use client';

import { Clock3 } from 'lucide-react';
import type * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type TimePickerProps = Omit<React.ComponentProps<'input'>, 'onChange' | 'type' | 'value'> & {
  value: string;
  onValueChange: (value: string) => void;
};

export function TimePicker({ className, value, onValueChange, ...props }: TimePickerProps) {
  return (
    <div className="relative">
      <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="time"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className={cn('h-11 pl-9', className)}
        {...props}
      />
    </div>
  );
}
