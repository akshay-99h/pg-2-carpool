'use client';

import { Clock3 } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TimePickerProps = {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  id?: string;
  placeholder?: string;
  step?: number;
  disabled?: boolean;
  'aria-label'?: string;
};

function toLabel(value: string) {
  const [hourPart, minutePart] = value.split(':');
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return value;
  }

  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${`${minute}`.padStart(2, '0')} ${suffix}`;
}

export function TimePicker({
  className,
  value,
  onValueChange,
  id,
  placeholder,
  step,
  disabled,
  'aria-label': ariaLabel,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const minuteStep = Math.max(1, Math.floor((Number(step) || 300) / 60));
  const options = React.useMemo(() => {
    const items: string[] = [];
    for (let minute = 0; minute < 24 * 60; minute += minuteStep) {
      const hours = `${Math.floor(minute / 60)}`.padStart(2, '0');
      const mins = `${minute % 60}`.padStart(2, '0');
      items.push(`${hours}:${mins}`);
    }
    return items;
  }, [minuteStep]);

  return (
    <>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-label={ariaLabel}
        className={cn(
          'flex h-11 w-full items-center rounded-xl border border-input bg-white px-3 text-left text-sm transition',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      >
        <Clock3 className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className={cn(value ? 'text-foreground' : 'text-muted-foreground')}>
          {value ? toLabel(value) : placeholder || 'Select time'}
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[90] flex items-end bg-slate-900/45 p-3 sm:items-center sm:justify-center"
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-white p-3 shadow-[0_28px_64px_-40px_rgba(16,34,29,0.75)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <p className="mb-2 text-sm font-semibold">Select time</p>
            <div className="max-h-64 overflow-y-auto rounded-xl border border-border">
              {options.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    onValueChange(item);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between border-b border-border/80 px-3 py-2 text-sm last:border-b-0',
                    item === value
                      ? 'bg-primary/10 font-semibold text-primary'
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  <span>{item}</span>
                  <span className="text-xs text-muted-foreground">{toLabel(item)}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onValueChange('');
                  setOpen(false);
                }}
              >
                Clear
              </Button>
              <Button type="button" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
