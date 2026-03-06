'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { ZodError } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { TimePicker } from '@/components/ui/time-picker';
import { combineDateAndTimeToIso, toDateInputValue, toTimeInputValue } from '@/lib/date-time';
import { apiFetch } from '@/lib/fetcher';
import { formatDateTime } from '@/lib/format';
import { poolRequestSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

type PoolRequestFormField =
  | 'tripType'
  | 'repeatDays'
  | 'from'
  | 'to'
  | 'route'
  | 'travelAtIso'
  | 'seatsNeeded';

const repeatDayLabel: Record<string, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

const repeatDayOptions = [
  { value: 'MON', label: 'Mon' },
  { value: 'TUE', label: 'Tue' },
  { value: 'WED', label: 'Wed' },
  { value: 'THU', label: 'Thu' },
  { value: 'FRI', label: 'Fri' },
  { value: 'SAT', label: 'Sat' },
  { value: 'SUN', label: 'Sun' },
] as const;

const defaultRepeatDays = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

type PoolRequest = {
  id: string;
  userId: string;
  tripType: 'DAILY' | 'ONE_TIME';
  repeatDays: string[];
  fromLocation: string;
  toLocation: string;
  route?: string | null;
  travelAt: string;
  seatsNeeded: number;
  user: {
    profile?: {
      name: string;
      towerFlat: string;
    } | null;
  };
};

type PoolRequestDraft = {
  tripType: 'DAILY' | 'ONE_TIME';
  repeatDays: string[];
  from: string;
  to: string;
  route: string;
  travelDate: string;
  travelTime: string;
  seatsNeeded: string;
};

type PoolRequestBoardProps = {
  currentUserId: string;
  currentUserRole: 'USER' | 'ADMIN';
  showComposer?: boolean;
  listTitle?: string;
  listDescription?: string;
  emptyStateText?: string;
};

function buildFieldErrors(error: ZodError) {
  const nextErrors: Partial<Record<PoolRequestFormField, string>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0] as PoolRequestFormField | undefined;
    if (field && !nextErrors[field]) {
      nextErrors[field] = issue.message;
    }
  }

  return nextErrors;
}

function getScheduleLabel(tripType: 'DAILY' | 'ONE_TIME', travelAt: string, repeatDays: string[]) {
  if (tripType === 'ONE_TIME') {
    return formatDateTime(travelAt);
  }

  const repeatLabel =
    repeatDays.length > 0
      ? repeatDays.map((day) => repeatDayLabel[day] ?? day).join(', ')
      : 'Daily';

  const timeLabel = new Date(travelAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `Repeats: ${repeatLabel} at ${timeLabel}`;
}

export function PoolRequestBoard({
  currentUserId,
  currentUserRole,
  showComposer = true,
  listTitle = 'Open passenger requests',
  listDescription = 'Browse posted pool requests from residents who need a seat.',
  emptyStateText = 'No open passenger requests.',
}: PoolRequestBoardProps) {
  const defaultTravel = new Date(Date.now() + 30 * 60 * 1000);
  const requiredStar = <span className="ml-1 text-red-600">*</span>;

  const [tripType, setTripType] = useState<'DAILY' | 'ONE_TIME'>('ONE_TIME');
  const [repeatDays, setRepeatDays] = useState<string[]>([]);
  const [from, setFrom] = useState('Panchsheel Greens 2');
  const [to, setTo] = useState('');
  const [route, setRoute] = useState('');
  const [travelDate, setTravelDate] = useState(toDateInputValue(defaultTravel));
  const [travelTime, setTravelTime] = useState(toTimeInputValue(defaultTravel));
  const [seatsNeeded, setSeatsNeeded] = useState('1');
  const [poolRequests, setPoolRequests] = useState<PoolRequest[]>([]);
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [savingId, setSavingId] = useState('');
  const [draft, setDraft] = useState<PoolRequestDraft | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<PoolRequestFormField, string>>>({});
  const [editFieldErrors, setEditFieldErrors] = useState<
    Partial<Record<PoolRequestFormField, string>>
  >({});
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await apiFetch<{ poolRequests: PoolRequest[] }>('/api/pool-requests');
      setPoolRequests(response.poolRequests);
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to load requests');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onPost = async () => {
    const scheduledDate = tripType === 'DAILY' ? toDateInputValue(new Date()) : travelDate;
    const travelAtIso = combineDateAndTimeToIso(scheduledDate, travelTime);

    if (!travelAtIso) {
      setError('Please choose a valid travel date and time.');
      setFieldErrors((previous) => ({ ...previous, travelAtIso: 'Travel date/time is required' }));
      return;
    }

    const parsed = poolRequestSchema.safeParse({
      tripType,
      repeatDays,
      from: from.trim(),
      to: to.trim(),
      route: route.trim() || undefined,
      travelAtIso,
      seatsNeeded: Number(seatsNeeded),
    });

    if (!parsed.success) {
      setFieldErrors(buildFieldErrors(parsed.error));
      setError('Please fix the highlighted fields.');
      return;
    }

    setPosting(true);
    setError('');
    setFieldErrors({});

    try {
      await apiFetch('/api/pool-requests', {
        method: 'POST',
        body: JSON.stringify(parsed.data),
      });

      setTo('');
      setRoute('');
      setSeatsNeeded('1');
      await load();
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Failed to post request');
    } finally {
      setPosting(false);
    }
  };

  const onRevoke = async (requestId: string) => {
    const confirmRevoke = window.confirm('Revoke this pool request?');
    if (!confirmRevoke) {
      return;
    }

    setDeletingId(requestId);
    setError('');

    try {
      await apiFetch(`/api/pool-requests/${requestId}`, {
        method: 'DELETE',
      });
      await load();
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to revoke pool request');
    } finally {
      setDeletingId('');
    }
  };

  const onStartEdit = (item: PoolRequest) => {
    const travelAt = new Date(item.travelAt);
    setEditingId(item.id);
    setDraft({
      tripType: item.tripType,
      repeatDays: item.tripType === 'DAILY' ? item.repeatDays : [],
      from: item.fromLocation,
      to: item.toLocation,
      route: item.route ?? '',
      travelDate: toDateInputValue(travelAt),
      travelTime: toTimeInputValue(travelAt),
      seatsNeeded: String(item.seatsNeeded),
    });
    setEditFieldErrors({});
    setError('');
  };

  const onCancelEdit = () => {
    setEditingId('');
    setDraft(null);
    setEditFieldErrors({});
  };

  const onSaveEdit = async (requestId: string) => {
    if (!draft) {
      return;
    }

    const scheduledDate =
      draft.tripType === 'DAILY' ? toDateInputValue(new Date()) : draft.travelDate;
    const travelAtIso = combineDateAndTimeToIso(scheduledDate, draft.travelTime);

    if (!travelAtIso) {
      setError('Please choose a valid travel date and time.');
      setEditFieldErrors((previous) => ({
        ...previous,
        travelAtIso: 'Travel date/time is required',
      }));
      return;
    }

    const parsed = poolRequestSchema.safeParse({
      tripType: draft.tripType,
      repeatDays: draft.repeatDays,
      from: draft.from.trim(),
      to: draft.to.trim(),
      route: draft.route.trim() || undefined,
      travelAtIso,
      seatsNeeded: Number(draft.seatsNeeded),
    });

    if (!parsed.success) {
      setEditFieldErrors(buildFieldErrors(parsed.error));
      setError('Please fix the highlighted fields.');
      return;
    }

    setSavingId(requestId);
    setError('');
    setEditFieldErrors({});

    try {
      await apiFetch(`/api/pool-requests/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify(parsed.data),
      });
      onCancelEdit();
      await load();
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to update pool request');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div className={showComposer ? 'grid gap-3 xl:grid-cols-[0.95fr_1.05fr]' : 'grid gap-3'}>
      {showComposer ? (
        <Card className="auth-hero-card xl:sticky xl:top-6">
          <CardHeader>
            <CardTitle>Post pool request</CardTitle>
            <CardDescription>
              Use when you need a seat and no matching trip exists yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>
                Request Type
                {requiredStar}
              </Label>
              <Select
                value={tripType}
                onChange={(event) => {
                  const value = event.target.value as 'DAILY' | 'ONE_TIME';
                  setTripType(value);
                  if (value === 'ONE_TIME') {
                    setRepeatDays([]);
                  } else if (repeatDays.length === 0) {
                    setRepeatDays(defaultRepeatDays);
                  }
                }}
                className={cn(fieldErrors.tripType ? 'border-red-500 ring-1 ring-red-300' : '')}
              >
                <option value="DAILY">Daily Basis</option>
                <option value="ONE_TIME">One Time</option>
              </Select>
              {fieldErrors.tripType ? (
                <p className="text-xs text-red-700">{fieldErrors.tripType}</p>
              ) : null}
            </div>

            {tripType === 'DAILY' ? (
              <div className="space-y-2">
                <Label>
                  Repeat days
                  {requiredStar}
                </Label>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {repeatDayOptions.map((day) => {
                    const selected = repeatDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() =>
                          setRepeatDays((current) =>
                            current.includes(day.value)
                              ? current.filter((item) => item !== day.value)
                              : [...current, day.value]
                          )
                        }
                        className={cn(
                          'rounded-lg border px-2 py-2 text-xs font-semibold transition',
                          selected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-white text-muted-foreground hover:bg-accent',
                          fieldErrors.repeatDays ? 'border-red-400' : ''
                        )}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Daily requests are visible only on selected weekdays.
                </p>
                {fieldErrors.repeatDays ? (
                  <p className="text-xs text-red-700">{fieldErrors.repeatDays}</p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>
                From
                {requiredStar}
              </Label>
              <Input
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className={cn(fieldErrors.from ? 'border-red-500 ring-1 ring-red-300' : '')}
              />
              {fieldErrors.from ? <p className="text-xs text-red-700">{fieldErrors.from}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>
                To
                {requiredStar}
              </Label>
              <Input
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className={cn(fieldErrors.to ? 'border-red-500 ring-1 ring-red-300' : '')}
              />
              {fieldErrors.to ? <p className="text-xs text-red-700">{fieldErrors.to}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Route (optional)</Label>
              <Input
                value={route}
                onChange={(event) => setRoute(event.target.value)}
                className={cn(fieldErrors.route ? 'border-red-500 ring-1 ring-red-300' : '')}
              />
              {fieldErrors.route ? (
                <p className="text-xs text-red-700">{fieldErrors.route}</p>
              ) : null}
            </div>

            {tripType === 'ONE_TIME' ? (
              <div className="space-y-2">
                <Label>
                  Date
                  {requiredStar}
                </Label>
                <DatePicker
                  value={travelDate}
                  onValueChange={setTravelDate}
                  className={cn(
                    fieldErrors.travelAtIso ? 'border-red-500 ring-1 ring-red-300' : ''
                  )}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Daily schedule</Label>
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
                  This request starts from today and repeats on selected days.
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>
                Time
                {requiredStar}
              </Label>
              <TimePicker
                value={travelTime}
                onValueChange={setTravelTime}
                step={300}
                className={cn(fieldErrors.travelAtIso ? 'border-red-500 ring-1 ring-red-300' : '')}
              />
              {fieldErrors.travelAtIso ? (
                <p className="text-xs text-red-700">{fieldErrors.travelAtIso}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>
                Seats needed
                {requiredStar}
              </Label>
              <Input
                type="number"
                min={1}
                max={4}
                value={seatsNeeded}
                onChange={(event) => setSeatsNeeded(event.target.value)}
                className={cn(fieldErrors.seatsNeeded ? 'border-red-500 ring-1 ring-red-300' : '')}
              />
              {fieldErrors.seatsNeeded ? (
                <p className="text-xs text-red-700">{fieldErrors.seatsNeeded}</p>
              ) : null}
            </div>

            {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
            <Button className="w-full" onClick={onPost} disabled={posting}>
              {posting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Post Request
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="auth-hero-card">
        <CardHeader>
          <CardTitle>{listTitle}</CardTitle>
          <CardDescription>{listDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
          {poolRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyStateText}</p>
          ) : null}
          {poolRequests.map((item) => {
            const isOwner = item.userId === currentUserId;
            const canEdit = isOwner;
            const canRevoke = isOwner || currentUserRole === 'ADMIN';

            return (
              <div
                key={item.id}
                className="auth-tile space-y-2 p-3 text-sm transition hover:bg-accent/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold leading-snug">
                      {item.fromLocation} → {item.toLocation}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={item.tripType === 'ONE_TIME' ? 'secondary' : 'default'}>
                        {item.tripType === 'ONE_TIME' ? 'One Time' : 'Daily'}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {getScheduleLabel(item.tripType, item.travelAt, item.repeatDays)}
                      </p>
                    </div>
                  </div>
                  {canRevoke ? (
                    <div className="flex gap-2">
                      {canEdit ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onStartEdit(item)}
                          disabled={deletingId === item.id || savingId === item.id}
                        >
                          Edit
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onRevoke(item.id)}
                        disabled={deletingId === item.id || savingId === item.id}
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Revoke
                      </Button>
                    </div>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.route || 'Route open'}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Passenger: {item.user.profile?.name ?? 'Resident'} (
                  {item.user.profile?.towerFlat ?? 'PG2'})
                </p>
                <p className="mt-2 inline-flex rounded-full border border-border bg-white px-2 py-1 text-[0.68rem] font-semibold text-foreground">
                  Seats needed: {item.seatsNeeded}
                </p>
                {canEdit && editingId === item.id && draft ? (
                  <div className="mt-2 space-y-2 rounded-xl border border-border bg-white p-3">
                    <div className="space-y-1">
                      <Label>Request Type</Label>
                      <Select
                        value={draft.tripType}
                        onChange={(event) => {
                          const value = event.target.value as 'DAILY' | 'ONE_TIME';
                          setDraft((previous) => {
                            if (!previous) {
                              return previous;
                            }

                            if (value === 'ONE_TIME') {
                              return { ...previous, tripType: value, repeatDays: [] };
                            }

                            return {
                              ...previous,
                              tripType: value,
                              repeatDays:
                                previous.repeatDays.length > 0
                                  ? previous.repeatDays
                                  : defaultRepeatDays,
                            };
                          });
                        }}
                        className={cn(
                          editFieldErrors.tripType ? 'border-red-500 ring-1 ring-red-300' : ''
                        )}
                      >
                        <option value="DAILY">Daily Basis</option>
                        <option value="ONE_TIME">One Time</option>
                      </Select>
                      {editFieldErrors.tripType ? (
                        <p className="text-xs text-red-700">{editFieldErrors.tripType}</p>
                      ) : null}
                    </div>

                    {draft.tripType === 'DAILY' ? (
                      <div className="space-y-1">
                        <Label>Repeat days</Label>
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                          {repeatDayOptions.map((day) => {
                            const selected = draft.repeatDays.includes(day.value);
                            return (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() =>
                                  setDraft((previous) =>
                                    previous
                                      ? {
                                          ...previous,
                                          repeatDays: previous.repeatDays.includes(day.value)
                                            ? previous.repeatDays.filter(
                                                (item) => item !== day.value
                                              )
                                            : [...previous.repeatDays, day.value],
                                        }
                                      : previous
                                  )
                                }
                                className={cn(
                                  'rounded-lg border px-2 py-2 text-xs font-semibold transition',
                                  selected
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border bg-white text-muted-foreground hover:bg-accent',
                                  editFieldErrors.repeatDays ? 'border-red-400' : ''
                                )}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                        {editFieldErrors.repeatDays ? (
                          <p className="text-xs text-red-700">{editFieldErrors.repeatDays}</p>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="space-y-1">
                      <Label>From</Label>
                      <Input
                        value={draft.from}
                        onChange={(event) =>
                          setDraft((previous) =>
                            previous ? { ...previous, from: event.target.value } : previous
                          )
                        }
                        className={cn(
                          editFieldErrors.from ? 'border-red-500 ring-1 ring-red-300' : ''
                        )}
                      />
                      {editFieldErrors.from ? (
                        <p className="text-xs text-red-700">{editFieldErrors.from}</p>
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <Label>To</Label>
                      <Input
                        value={draft.to}
                        onChange={(event) =>
                          setDraft((previous) =>
                            previous ? { ...previous, to: event.target.value } : previous
                          )
                        }
                        className={cn(
                          editFieldErrors.to ? 'border-red-500 ring-1 ring-red-300' : ''
                        )}
                      />
                      {editFieldErrors.to ? (
                        <p className="text-xs text-red-700">{editFieldErrors.to}</p>
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <Label>Route</Label>
                      <Input
                        value={draft.route}
                        onChange={(event) =>
                          setDraft((previous) =>
                            previous ? { ...previous, route: event.target.value } : previous
                          )
                        }
                        className={cn(
                          editFieldErrors.route ? 'border-red-500 ring-1 ring-red-300' : ''
                        )}
                      />
                      {editFieldErrors.route ? (
                        <p className="text-xs text-red-700">{editFieldErrors.route}</p>
                      ) : null}
                    </div>
                    {draft.tripType === 'ONE_TIME' ? (
                      <div className="space-y-1">
                        <Label>Date</Label>
                        <DatePicker
                          value={draft.travelDate}
                          onValueChange={(value) =>
                            setDraft((previous) =>
                              previous ? { ...previous, travelDate: value } : previous
                            )
                          }
                          className={cn(
                            editFieldErrors.travelAtIso ? 'border-red-500 ring-1 ring-red-300' : ''
                          )}
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Label>Daily schedule</Label>
                        <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
                          This request starts from today and repeats on selected days.
                        </div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label>Time</Label>
                      <TimePicker
                        value={draft.travelTime}
                        onValueChange={(value) =>
                          setDraft((previous) =>
                            previous ? { ...previous, travelTime: value } : previous
                          )
                        }
                        step={300}
                        className={cn(
                          editFieldErrors.travelAtIso ? 'border-red-500 ring-1 ring-red-300' : ''
                        )}
                      />
                      {editFieldErrors.travelAtIso ? (
                        <p className="text-xs text-red-700">{editFieldErrors.travelAtIso}</p>
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <Label>Seats needed</Label>
                      <Input
                        type="number"
                        min={1}
                        max={4}
                        value={draft.seatsNeeded}
                        onChange={(event) =>
                          setDraft((previous) =>
                            previous ? { ...previous, seatsNeeded: event.target.value } : previous
                          )
                        }
                        className={cn(
                          editFieldErrors.seatsNeeded ? 'border-red-500 ring-1 ring-red-300' : ''
                        )}
                      />
                      {editFieldErrors.seatsNeeded ? (
                        <p className="text-xs text-red-700">{editFieldErrors.seatsNeeded}</p>
                      ) : null}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onCancelEdit}
                        disabled={savingId === item.id}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onSaveEdit(item.id)}
                        disabled={savingId === item.id}
                      >
                        {savingId === item.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Save
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
