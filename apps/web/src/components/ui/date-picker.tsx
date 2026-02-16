'use client';

import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { toDateInputValue } from '@/lib/date-time';
import { cn } from '@/lib/utils';

type DatePickerProps = {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  id?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  'aria-label'?: string;
};

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function parseInputDate(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function DatePicker({
  className,
  value,
  onValueChange,
  id,
  placeholder,
  min,
  max,
  disabled,
  'aria-label': ariaLabel,
}: DatePickerProps) {
  const selectedDate = parseInputDate(value);
  const minDate = parseInputDate(typeof min === 'string' ? min : '');
  const maxDate = parseInputDate(typeof max === 'string' ? max : '');

  const [open, setOpen] = React.useState(false);
  const [viewMonth, setViewMonth] = React.useState(selectedDate ?? new Date());

  React.useEffect(() => {
    if (selectedDate) {
      setViewMonth(selectedDate);
    }
  }, [selectedDate]);

  const days = React.useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });

    const items: Date[] = [];
    let cursor = gridStart;
    while (cursor <= gridEnd) {
      items.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return items;
  }, [viewMonth]);

  const selectDate = (date: Date) => {
    const nextValue = toDateInputValue(date);
    onValueChange(nextValue);
    setOpen(false);
  };

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
        <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className={cn(value ? 'text-foreground' : 'text-muted-foreground')}>
          {selectedDate ? format(selectedDate, 'dd MMM yyyy') : placeholder || 'Select date'}
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
            <div className="mb-3 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setViewMonth((current) => subMonths(current, 1))}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm font-semibold">{format(viewMonth, 'MMMM yyyy')}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setViewMonth((current) => addMonths(current, 1))}
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {weekDays.map((label) => (
                <span key={label} className="py-1.5">
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {days.map((day) => {
                const dayValue = toDateInputValue(day);
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const outOfMonth = !isSameMonth(day, viewMonth);
                const blockedByMin = minDate ? day < minDate : false;
                const blockedByMax = maxDate ? day > maxDate : false;
                const isBlocked = blockedByMin || blockedByMax;

                return (
                  <button
                    key={dayValue}
                    type="button"
                    disabled={isBlocked}
                    onClick={() => selectDate(day)}
                    className={cn(
                      'h-9 rounded-lg text-sm transition',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-transparent text-foreground hover:bg-accent',
                      outOfMonth && !isSelected ? 'text-muted-foreground/55' : '',
                      isBlocked ? 'cursor-not-allowed opacity-40' : ''
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
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
