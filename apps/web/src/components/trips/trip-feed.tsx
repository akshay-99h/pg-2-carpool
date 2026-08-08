'use client';

import {
  LocateFixed,
  MapPinned,
  Pencil,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TimePicker } from '@/components/ui/time-picker';
import { trackEvent } from '@/lib/analytics';
import { combineDateAndTimeToIso, toDateInputValue, toTimeInputValue } from '@/lib/date-time';
import { apiFetch } from '@/lib/fetcher';
import { formatDateTime } from '@/lib/format';
import { createTripSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

const repeatDayLabel: Record<string, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

type Trip = {
  id: string;
  tripType: 'DAILY' | 'ONE_TIME';
  repeatDays: string[];
  fromLocation: string;
  route: string;
  toLocation: string;
  departAt: string;
  seatsAvailable: number;
  seatsBooked: number;
  notes?: string | null;
  driver: {
    id: string;
    profile?: {
      name: string;
      towerFlat: string;
    } | null;
  };
  requests: Array<{ id: string; status: 'PENDING' | 'CONFIRMED' | 'REJECTED' }>;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type TripFormField =
  | 'tripType'
  | 'repeatDays'
  | 'from'
  | 'route'
  | 'to'
  | 'departAtIso'
  | 'seatsAvailable'
  | 'notes';

type EditTripDraft = {
  tripType: 'DAILY' | 'ONE_TIME';
  repeatDays: string[];
  from: string;
  route: string;
  to: string;
  travelDate: string;
  travelTime: string;
  seatsAvailable: string;
  notes: string;
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

function createEditDraft(trip: Trip): EditTripDraft {
  const departAt = new Date(trip.departAt);
  return {
    tripType: trip.tripType,
    repeatDays: trip.repeatDays,
    from: trip.fromLocation,
    route: trip.route,
    to: trip.toLocation,
    travelDate: toDateInputValue(departAt),
    travelTime: toTimeInputValue(departAt),
    seatsAvailable: String(trip.seatsAvailable),
    notes: trip.notes ?? '',
  };
}

export function TripFeed({
  currentUserId,
  currentUserRole,
}: {
  currentUserId: string;
  currentUserRole: 'USER' | 'ADMIN';
}) {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fromLocation, setFromLocation] = useState('Panchsheel Greens 2');
  const [travelDate, setTravelDate] = useState('');
  const [travelTime, setTravelTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [revokingRequestId, setRevokingRequestId] = useState<string | null>(null);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [editTripDraft, setEditTripDraft] = useState<EditTripDraft | null>(null);
  const [editFieldErrors, setEditFieldErrors] = useState<Partial<Record<TripFormField, string>>>(
    {}
  );

  const loadTrips = useCallback(
    async (targetPage = 1) => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();
        const effectiveTravelDate =
          travelTime && !travelDate ? toDateInputValue(new Date()) : travelDate;
        if (activeQuery) {
          params.set('q', activeQuery);
        }
        if (fromLocation.trim()) {
          params.set('from', fromLocation.trim());
        }
        if (effectiveTravelDate) {
          params.set('travelDate', effectiveTravelDate);
        }
        if (travelTime) {
          params.set('travelTime', travelTime);
        }
        params.set('page', String(targetPage));
        params.set('pageSize', '20');

        const response = await apiFetch<{ trips: Trip[]; pagination: Pagination }>(
          `/api/trips?${params.toString()}`
        );
        setTrips(response.trips);
        setPagination(response.pagination);
      } catch (errorValue) {
        setError(errorValue instanceof Error ? errorValue.message : 'Unable to fetch trips');
      } finally {
        setLoading(false);
      }
    },
    [activeQuery, fromLocation, travelDate, travelTime]
  );

  useEffect(() => {
    void loadTrips(page);
  }, [loadTrips, page]);

  // Only the non-default filters count, so the badge reflects what the resident
  // actually narrowed down rather than always showing the default pickup point.
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (travelDate) count += 1;
    if (travelTime) count += 1;
    if (fromLocation.trim() && fromLocation.trim() !== 'Panchsheel Greens 2') count += 1;
    return count;
  }, [travelDate, travelTime, fromLocation]);

  const popularDestinations = useMemo(() => {
    const seen = new Set<string>();
    const destinations: string[] = [];
    for (const trip of trips) {
      const destination = trip.toLocation.trim();
      if (destination && !seen.has(destination.toLowerCase())) {
        seen.add(destination.toLowerCase());
        destinations.push(destination);
      }
      if (destinations.length === 4) {
        break;
      }
    }
    return destinations;
  }, [trips]);

  const requestSeat = async (tripId: string) => {
    setLoading(true);
    try {
      await apiFetch(`/api/trips/${tripId}/request`, { method: 'POST' });
      trackEvent({ name: 'seat_requested' });
      await loadTrips(page);
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Could not request seat');
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (tripId: string) => {
    if (!window.confirm('Delete this trip? This will also remove any related bookings.')) {
      return;
    }

    setDeletingTripId(tripId);
    setError('');

    try {
      await apiFetch(`/api/trips/${tripId}`, { method: 'DELETE' });
      trackEvent({ name: 'trip_deleted' });
      toast.success('Trip deleted successfully.');

      const nextPage =
        pagination && pagination.page > 1 && trips.length === 1 ? pagination.page - 1 : page;

      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await loadTrips(page);
      }
    } catch (errorValue) {
      const message = errorValue instanceof Error ? errorValue.message : 'Could not delete trip';
      setError(message);
      toast.error(message);
    } finally {
      setDeletingTripId(null);
    }
  };

  const revokeBooking = async (requestId: string) => {
    if (!window.confirm('Revoke this booking request?')) {
      return;
    }

    setRevokingRequestId(requestId);
    setError('');

    try {
      await apiFetch(`/api/trip-requests/${requestId}`, { method: 'DELETE' });
      trackEvent({ name: 'booking_revoked', props: { by: 'passenger' } });
      toast.success('Booking revoked.');
      await loadTrips(page);
    } catch (errorValue) {
      const message = errorValue instanceof Error ? errorValue.message : 'Could not revoke booking';
      setError(message);
      toast.error(message);
    } finally {
      setRevokingRequestId(null);
    }
  };

  const startEditingTrip = (trip: Trip) => {
    setEditingTripId(trip.id);
    setEditTripDraft(createEditDraft(trip));
    setEditFieldErrors({});
    setError('');
  };

  const cancelEditingTrip = () => {
    setEditingTripId(null);
    setEditTripDraft(null);
    setEditFieldErrors({});
  };

  const saveTrip = async (tripId: string) => {
    if (!editTripDraft) {
      return;
    }

    const departAtIso =
      editTripDraft.tripType === 'DAILY'
        ? combineDateAndTimeToIso(toDateInputValue(new Date()), editTripDraft.travelTime)
        : combineDateAndTimeToIso(editTripDraft.travelDate, editTripDraft.travelTime);

    if (!departAtIso) {
      setEditFieldErrors((previous) => ({
        ...previous,
        departAtIso: 'Travel date/time is required',
      }));
      setError('Please choose a valid travel date and time');
      return;
    }

    const parsed = createTripSchema.safeParse({
      tripType: editTripDraft.tripType,
      repeatDays: editTripDraft.repeatDays,
      from: editTripDraft.from.trim(),
      route: editTripDraft.route.trim(),
      to: editTripDraft.to.trim(),
      departAtIso,
      seatsAvailable: Number(editTripDraft.seatsAvailable),
      notes: editTripDraft.notes.trim() || undefined,
    });

    if (!parsed.success) {
      const nextErrors: Partial<Record<TripFormField, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as TripFormField | undefined;
        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setEditFieldErrors(nextErrors);
      setError('Please fix the highlighted fields.');
      return;
    }

    setDeletingTripId(tripId);
    setError('');
    setEditFieldErrors({});

    try {
      await apiFetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        body: JSON.stringify(parsed.data),
      });
      toast.success('Trip updated successfully.');
      cancelEditingTrip();
      await loadTrips(page);
    } catch (errorValue) {
      const message = errorValue instanceof Error ? errorValue.message : 'Could not update trip';
      setError(message);
      toast.error(message);
    } finally {
      setDeletingTripId(null);
    }
  };

  const applyNowFilters = () => {
    const now = new Date();
    setTravelDate(toDateInputValue(now));
    setTravelTime(toTimeInputValue(now));
    setPage(1);
  };

  const clearFilters = () => {
    setTravelDate('');
    setTravelTime('');
    setPage(1);
  };

  return (
    <div className="space-y-3">
      {/* Search is one compact row. The detailed filters stay collapsed so the
          rides themselves - the reason people open this screen - start near the
          top instead of below a full screen of controls. */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Where do you want to go?"
              aria-label="Search destination"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  setPage(1);
                  setActiveQuery(query.trim());
                }
              }}
            />
          </div>
          <Button
            type="button"
            size="icon"
            aria-label="Search rides"
            onClick={() => {
              setPage(1);
              setActiveQuery(query.trim());
            }}
          >
            <Search className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((current) => !current)}
            className="shrink-0 px-3.5"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            <span className="ml-1.5 hidden sm:inline">Filters</span>
            {activeFilterCount > 0 ? (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[0.65rem] font-semibold text-primary-foreground">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>
        </div>

        {filtersOpen ? (
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="relative">
                <LocateFixed className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  className="pl-9"
                  value={fromLocation}
                  aria-label="Pickup from"
                  onChange={(event) => {
                    setFromLocation(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Pickup from"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <DatePicker
                  value={travelDate}
                  onValueChange={(value) => {
                    setTravelDate(value);
                    setPage(1);
                  }}
                  placeholder="Travel date"
                  aria-label="Travel date"
                />
                <TimePicker
                  value={travelTime}
                  onValueChange={(value) => {
                    setTravelTime(value);
                    setPage(1);
                  }}
                  step={300}
                  placeholder="Travel time"
                  aria-label="Travel time"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={applyNowFilters}>
                  Leave Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {popularDestinations.length > 0 ? (
          // One scrollable row rather than a wrapping block that ate two lines
          // of vertical space above the results.
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {popularDestinations.map((destination) => (
              <button
                key={destination}
                type="button"
                className="surface-inset shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary/30 hover:bg-white"
                onClick={() => {
                  setQuery(destination);
                  setPage(1);
                  setActiveQuery(destination);
                }}
              >
                {destination}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <output aria-live="polite" className="block">
        {loading ? <p className="text-sm text-muted-foreground">Loading rides…</p> : null}
        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
      </output>

      {!loading && trips.length === 0 ? (
        <Card>
          <CardContent className="space-y-2 p-5 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">No matching rides found</p>
            <p>Try another destination or clear your date and time filters.</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-2">
        {trips.map((trip) => {
          const isDriver = trip.driver.id === currentUserId;
          const canEditTrip = isDriver || currentUserRole === 'ADMIN';
          const canDeleteTrip = isDriver || currentUserRole === 'ADMIN';
          const request = trip.requests[0];
          const seatsLeft = Math.max(0, trip.seatsAvailable - trip.seatsBooked);

          const repeatLabel =
            trip.tripType === 'DAILY' && trip.repeatDays.length > 0
              ? trip.repeatDays.map((day) => repeatDayLabel[day] ?? day).join(', ')
              : 'Daily';

          return (
            <Card key={trip.id} className="overflow-hidden">
              <CardContent className="space-y-4 p-4">
                {/* Badges, time and owner in two lines instead of three - the
                    seats badge used to wrap onto a row of its own at 375px. */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <Badge variant={trip.tripType === 'ONE_TIME' ? 'secondary' : 'default'}>
                      {trip.tripType === 'ONE_TIME' ? 'One Time' : 'Daily'}
                    </Badge>
                    <Badge variant={seatsLeft > 0 ? 'default' : 'danger'}>
                      {seatsLeft > 0
                        ? `${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} left`
                        : 'Full'}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground">
                      {trip.tripType === 'ONE_TIME'
                        ? formatDateTime(trip.departAt)
                        : `${repeatLabel} · ${new Date(trip.departAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {trip.driver.profile?.name ?? 'Resident'} ·{' '}
                    {trip.driver.profile?.towerFlat ?? 'PG2'}
                  </p>
                </div>

                <div className="surface-inset rounded-2xl p-3">
                  <div className="relative space-y-4 pl-5">
                    <span className="absolute bottom-2 left-[0.45rem] top-2 w-px bg-border" />
                    <div className="relative">
                      <span className="absolute -left-[1.05rem] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        From
                      </p>
                      <p className="text-sm font-semibold text-foreground">{trip.fromLocation}</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[1.05rem] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-400" />
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        To
                      </p>
                      <p className="text-sm font-semibold text-foreground">{trip.toLocation}</p>
                    </div>
                  </div>

                  {/* Only trip-specific facts are shown. "On-time pickup
                      expected", "Resident verified" and "Shared cost commute"
                      were identical on every card and cost ~130px each time. */}
                  {trip.route ? (
                    <p className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border/70 bg-white px-3 py-2 text-xs text-muted-foreground">
                      <MapPinned className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                      {trip.route}
                    </p>
                  ) : null}

                  {trip.notes ? (
                    <p className="mt-2 inline-flex items-start gap-2 text-xs text-muted-foreground">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                      Note: {trip.notes}
                    </p>
                  ) : null}
                </div>

                {editingTripId === trip.id && editTripDraft ? (
                  <div className="space-y-3 rounded-2xl border border-border/70 bg-white p-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Trip Type</Label>
                        <Select
                          value={editTripDraft.tripType}
                          onChange={(event) => {
                            const value = event.target.value as 'DAILY' | 'ONE_TIME';
                            setEditTripDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    tripType: value,
                                    repeatDays:
                                      value === 'ONE_TIME'
                                        ? []
                                        : current.repeatDays.length > 0
                                          ? current.repeatDays
                                          : ['MON', 'TUE', 'WED', 'THU', 'FRI'],
                                  }
                                : current
                            );
                          }}
                          className={cn(
                            editFieldErrors.tripType ? 'border-red-500 ring-1 ring-red-300' : ''
                          )}
                        >
                          <option value="DAILY">Daily Basis</option>
                          <option value="ONE_TIME">One Time</option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Seats Available</Label>
                        <Input
                          type="number"
                          min={1}
                          max={7}
                          value={editTripDraft.seatsAvailable}
                          onChange={(event) =>
                            setEditTripDraft((current) =>
                              current ? { ...current, seatsAvailable: event.target.value } : current
                            )
                          }
                          className={cn(
                            editFieldErrors.seatsAvailable
                              ? 'border-red-500 ring-1 ring-red-300'
                              : ''
                          )}
                        />
                      </div>
                    </div>

                    {editTripDraft.tripType === 'DAILY' ? (
                      <div className="space-y-2">
                        <Label>Repeat days</Label>
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                          {repeatDayOptions.map((day) => {
                            const selected = editTripDraft.repeatDays.includes(day.value);
                            return (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() =>
                                  setEditTripDraft((current) =>
                                    current
                                      ? {
                                          ...current,
                                          repeatDays: current.repeatDays.includes(day.value)
                                            ? current.repeatDays.filter(
                                                (item) => item !== day.value
                                              )
                                            : [...current.repeatDays, day.value],
                                        }
                                      : current
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

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>From</Label>
                        <Input
                          value={editTripDraft.from}
                          onChange={(event) =>
                            setEditTripDraft((current) =>
                              current ? { ...current, from: event.target.value } : current
                            )
                          }
                          className={cn(
                            editFieldErrors.from ? 'border-red-500 ring-1 ring-red-300' : ''
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>To</Label>
                        <Input
                          value={editTripDraft.to}
                          onChange={(event) =>
                            setEditTripDraft((current) =>
                              current ? { ...current, to: event.target.value } : current
                            )
                          }
                          className={cn(
                            editFieldErrors.to ? 'border-red-500 ring-1 ring-red-300' : ''
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Route details</Label>
                      <Input
                        value={editTripDraft.route}
                        onChange={(event) =>
                          setEditTripDraft((current) =>
                            current ? { ...current, route: event.target.value } : current
                          )
                        }
                        className={cn(
                          editFieldErrors.route ? 'border-red-500 ring-1 ring-red-300' : ''
                        )}
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {editTripDraft.tripType === 'ONE_TIME' ? (
                        <div className="space-y-2">
                          <Label>Travel Date</Label>
                          <DatePicker
                            value={editTripDraft.travelDate}
                            onValueChange={(value) =>
                              setEditTripDraft((current) =>
                                current ? { ...current, travelDate: value } : current
                              )
                            }
                            className={cn(
                              editFieldErrors.departAtIso
                                ? 'border-red-500 ring-1 ring-red-300'
                                : ''
                            )}
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>Daily schedule</Label>
                          <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
                            This ride repeats on the selected weekdays.
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>
                          {editTripDraft.tripType === 'DAILY' ? 'Departure Time' : 'Travel Time'}
                        </Label>
                        <TimePicker
                          value={editTripDraft.travelTime}
                          onValueChange={(value) =>
                            setEditTripDraft((current) =>
                              current ? { ...current, travelTime: value } : current
                            )
                          }
                          step={300}
                          className={cn(
                            editFieldErrors.departAtIso ? 'border-red-500 ring-1 ring-red-300' : ''
                          )}
                        />
                        {editFieldErrors.departAtIso ? (
                          <p className="text-xs text-red-700">{editFieldErrors.departAtIso}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={editTripDraft.notes}
                        onChange={(event) =>
                          setEditTripDraft((current) =>
                            current ? { ...current, notes: event.target.value } : current
                          )
                        }
                        className={cn(
                          editFieldErrors.notes ? 'border-red-500 ring-1 ring-red-300' : ''
                        )}
                      />
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditingTrip}
                        disabled={deletingTripId === trip.id}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveTrip(trip.id)}
                        disabled={deletingTripId === trip.id}
                      >
                        {deletingTripId === trip.id ? 'Saving...' : 'Save Trip'}
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {isDriver ? (
                    <Badge variant="outline">Your trip</Badge>
                  ) : request ? (
                    <>
                      <Badge
                        variant={
                          request.status === 'CONFIRMED'
                            ? 'success'
                            : request.status === 'REJECTED'
                              ? 'danger'
                              : 'warning'
                        }
                        className={cn('w-fit')}
                      >
                        Booking {request.status}
                      </Badge>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => revokeBooking(request.id)}
                        disabled={revokingRequestId === request.id}
                      >
                        {revokingRequestId === request.id ? 'Revoking...' : 'Revoke booking'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => requestSeat(trip.id)}
                      disabled={seatsLeft <= 0}
                      className="flex-1"
                    >
                      {seatsLeft <= 0 ? 'No seats left' : 'Book this ride'}
                    </Button>
                  )}

                  {canEditTrip ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 sm:flex-none"
                      onClick={() => startEditingTrip(trip)}
                      disabled={deletingTripId === trip.id}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit trip
                    </Button>
                  ) : null}

                  {canDeleteTrip ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 sm:flex-none"
                      onClick={() => deleteTrip(trip.id)}
                      disabled={deletingTripId === trip.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deletingTripId === trip.id ? 'Deleting...' : 'Delete trip'}
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination sits under the results, not above them. */}
      {pagination && pagination.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
          <p>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} rides)
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              disabled={loading || pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPage((previous) => Math.min(pagination.totalPages, previous + 1))}
              disabled={loading || pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
