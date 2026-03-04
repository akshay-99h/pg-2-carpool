'use client';

import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TimePicker } from '@/components/ui/time-picker';
import { combineDateAndTimeToIso, toDateInputValue, toTimeInputValue } from '@/lib/date-time';
import { apiFetch } from '@/lib/fetcher';
import { formatDateTime } from '@/lib/format';
import { createTripSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

type IncomingRequest = {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  trip: {
    fromLocation: string;
    toLocation: string;
    departAt: string;
  };
  rider: {
    profile?: {
      name: string;
      towerFlat: string;
    } | null;
  };
};

type OutgoingRequest = {
  id: string;
  note?: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  trip: {
    fromLocation: string;
    toLocation: string;
    departAt: string;
    driver: {
      profile?: {
        name: string;
        mobileNumber: string;
      } | null;
    };
  };
};

type MyTrip = {
  id: string;
  tripType: 'DAILY' | 'ONE_TIME';
  status: 'ACTIVE' | 'CANCELLED';
  fromLocation: string;
  toLocation: string;
  route: string;
  departAt: string;
  seatsAvailable: number;
  seatsBooked: number;
  notes?: string | null;
  repeatDays: string[];
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

function createEditDraft(trip: MyTrip): EditTripDraft {
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

export function BookingManager() {
  const [incoming, setIncoming] = useState<IncomingRequest[]>([]);
  const [outgoing, setOutgoing] = useState<OutgoingRequest[]>([]);
  const [myTrips, setMyTrips] = useState<MyTrip[]>([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [editTripDraft, setEditTripDraft] = useState<EditTripDraft | null>(null);
  const [editFieldErrors, setEditFieldErrors] = useState<Partial<Record<TripFormField, string>>>(
    {}
  );

  const load = useCallback(async () => {
    try {
      const response = await apiFetch<{
        incoming: IncomingRequest[];
        outgoing: OutgoingRequest[];
        myTrips: MyTrip[];
      }>('/api/trip-requests');
      setIncoming(response.incoming);
      setOutgoing(response.outgoing);
      setMyTrips(response.myTrips);
      setNoteDrafts((previous) => {
        const next: Record<string, string> = {};
        for (const item of response.outgoing) {
          next[item.id] = previous[item.id] ?? item.note ?? '';
        }
        return next;
      });
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to load bookings');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (requestId: string, status: 'CONFIRMED' | 'REJECTED') => {
    setBusyId(requestId);
    try {
      await apiFetch(`/api/trip-requests/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to update booking');
    } finally {
      setBusyId('');
    }
  };

  const saveNote = async (requestId: string) => {
    setBusyId(requestId);
    try {
      await apiFetch(`/api/trip-requests/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ note: noteDrafts[requestId] ?? '' }),
      });
      await load();
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to update booking note');
    } finally {
      setBusyId('');
    }
  };

  const deleteBooking = async (requestId: string) => {
    const confirmDelete = window.confirm('Delete this booking request?');
    if (!confirmDelete) {
      return;
    }

    setBusyId(requestId);
    try {
      await apiFetch(`/api/trip-requests/${requestId}`, {
        method: 'DELETE',
      });
      await load();
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to delete booking');
    } finally {
      setBusyId('');
    }
  };

  const deleteTrip = async (tripId: string) => {
    const confirmDelete = window.confirm('Delete this trip? This will also remove any related bookings.');
    if (!confirmDelete) {
      return;
    }

    setBusyId(tripId);
    try {
      await apiFetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
      });
      toast.success('Trip deleted successfully.');
      await load();
    } catch (errorValue) {
      const message = errorValue instanceof Error ? errorValue.message : 'Unable to delete trip';
      setError(message);
      toast.error(message);
    } finally {
      setBusyId('');
    }
  };

  const startEditingTrip = (trip: MyTrip) => {
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

    setBusyId(tripId);
    setError('');
    setEditFieldErrors({});

    try {
      await apiFetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        body: JSON.stringify(parsed.data),
      });
      toast.success('Trip updated successfully.');
      cancelEditingTrip();
      await load();
    } catch (errorValue) {
      const message = errorValue instanceof Error ? errorValue.message : 'Unable to update trip';
      setError(message);
      toast.error(message);
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      <div className="grid gap-3 xl:grid-cols-2">
        <Card className="auth-hero-card">
          <CardHeader>
            <CardTitle>Requests on your trips</CardTitle>
            <p className="text-sm text-muted-foreground">
              Accept or reject riders requesting seats in your trips.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {incoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests yet.</p>
            ) : null}
            {incoming.map((item) => (
              <div key={item.id} className="auth-tile space-y-2 p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">
                    {item.trip.fromLocation} → {item.trip.toLocation}
                  </p>
                  <Badge
                    variant={
                      item.status === 'CONFIRMED'
                        ? 'success'
                        : item.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(item.trip.departAt)}
                </p>
                <p>
                  Rider: {item.rider.profile?.name ?? 'Resident'} (
                  {item.rider.profile?.towerFlat ?? 'PG2'})
                </p>
                <div className="flex items-center justify-end gap-2">
                  {item.status === 'PENDING' ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateStatus(item.id, 'CONFIRMED')}
                        disabled={busyId === item.id}
                      >
                        {busyId === item.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(item.id, 'REJECTED')}
                        disabled={busyId === item.id}
                      >
                        {busyId === item.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Reject
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="auth-hero-card">
          <CardHeader>
            <CardTitle>My bookings</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track the status of seat requests you sent.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {outgoing.length === 0 ? (
              <p className="text-sm text-muted-foreground">You have not requested any seats yet.</p>
            ) : null}
            {outgoing.map((item) => (
              <div key={item.id} className="auth-tile p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">
                    {item.trip.fromLocation} → {item.trip.toLocation}
                  </p>
                  <Badge
                    variant={
                      item.status === 'CONFIRMED'
                        ? 'success'
                        : item.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(item.trip.departAt)}
                </p>
                <p className="mt-1 text-muted-foreground">
                  Car owner: {item.trip.driver.profile?.name ?? 'Resident'}
                </p>
                {item.status === 'CONFIRMED' && item.trip.driver.profile?.mobileNumber ? (
                  <div className="mt-2">
                    <Button asChild size="sm" className="w-full">
                      <a
                        href={`https://wa.me/91${item.trip.driver.profile.mobileNumber}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Chat with OP
                      </a>
                    </Button>
                  </div>
                ) : null}
                <div className="mt-3 space-y-2">
                  <Input
                    value={noteDrafts[item.id] ?? ''}
                    onChange={(event) =>
                      setNoteDrafts((previous) => ({
                        ...previous,
                        [item.id]: event.target.value,
                      }))
                    }
                    placeholder="Booking note for car owner"
                    disabled={item.status !== 'PENDING' || busyId === item.id}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveNote(item.id)}
                      disabled={item.status !== 'PENDING' || busyId === item.id}
                    >
                      {busyId === item.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Save Note
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteBooking(item.id)}
                      disabled={busyId === item.id}
                    >
                      {busyId === item.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Delete Booking
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="auth-hero-card">
        <CardHeader>
          <CardTitle>My posted trips</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and delete the trips you have published.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {myTrips.length === 0 ? (
            <p className="text-sm text-muted-foreground">You have not posted any trips yet.</p>
          ) : null}
          {myTrips.map((trip) => {
            const repeatLabel =
              trip.tripType === 'DAILY' && trip.repeatDays.length > 0
                ? trip.repeatDays.map((day) => repeatDayLabel[day] ?? day).join(', ')
                : 'Daily';

            return (
              <div key={trip.id} className="auth-tile space-y-2 p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {trip.fromLocation} → {trip.toLocation}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {trip.tripType === 'ONE_TIME'
                        ? formatDateTime(trip.departAt)
                        : `Repeats: ${repeatLabel} at ${new Date(trip.departAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                  <Badge variant={trip.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {trip.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{trip.route || 'Route details not provided'}</p>
                <p className="text-xs text-muted-foreground">
                  Seats booked: {trip.seatsBooked}/{trip.seatsAvailable}
                </p>
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
                          className={cn(editFieldErrors.tripType ? 'border-red-500 ring-1 ring-red-300' : '')}
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
                            editFieldErrors.seatsAvailable ? 'border-red-500 ring-1 ring-red-300' : ''
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
                                            ? current.repeatDays.filter((item) => item !== day.value)
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
                          className={cn(editFieldErrors.from ? 'border-red-500 ring-1 ring-red-300' : '')}
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
                          className={cn(editFieldErrors.to ? 'border-red-500 ring-1 ring-red-300' : '')}
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
                        className={cn(editFieldErrors.route ? 'border-red-500 ring-1 ring-red-300' : '')}
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
                              editFieldErrors.departAtIso ? 'border-red-500 ring-1 ring-red-300' : ''
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
                        <Label>{editTripDraft.tripType === 'DAILY' ? 'Departure Time' : 'Travel Time'}</Label>
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
                        className={cn(editFieldErrors.notes ? 'border-red-500 ring-1 ring-red-300' : '')}
                      />
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditingTrip}
                        disabled={busyId === trip.id}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => saveTrip(trip.id)} disabled={busyId === trip.id}>
                        {busyId === trip.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Trip
                      </Button>
                    </div>
                  </div>
                ) : null}
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditingTrip(trip)}
                    disabled={busyId === trip.id}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Trip
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteTrip(trip.id)}
                    disabled={busyId === trip.id}
                  >
                    {busyId === trip.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Delete Trip
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
