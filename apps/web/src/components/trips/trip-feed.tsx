'use client';

import {
  CarFront,
  Clock3,
  LocateFixed,
  MapPinned,
  Search,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { TimePicker } from '@/components/ui/time-picker';
import {
  isSameInputDate,
  minuteOfDayFromDate,
  minuteOfDayFromInput,
  toDateInputValue,
  toTimeInputValue,
} from '@/lib/date-time';
import { apiFetch } from '@/lib/fetcher';
import { formatDateTime } from '@/lib/format';
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

export function TripFeed({ currentUserId }: { currentUserId: string }) {
  const [query, setQuery] = useState('');
  const [fromLocation, setFromLocation] = useState('Panchsheel Greens 2');
  const [travelDate, setTravelDate] = useState('');
  const [travelTime, setTravelTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);

  const loadTrips = useCallback(async (search = '') => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (search) {
        params.set('q', search);
      }
      const response = await apiFetch<{ trips: Trip[] }>(`/api/trips?${params.toString()}`);
      setTrips(response.trips);
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to fetch trips');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTrips();
  }, [loadTrips]);

  const filteredTrips = useMemo(() => {
    const fromFilter = fromLocation.trim().toLowerCase();
    const selectedMinute = minuteOfDayFromInput(travelTime);

    const withFilters = trips.filter((trip) => {
      const tripDepartAt = new Date(trip.departAt);
      if (fromFilter && !trip.fromLocation.toLowerCase().includes(fromFilter)) {
        return false;
      }

      if (travelDate && !isSameInputDate(tripDepartAt, travelDate)) {
        return false;
      }

      if (selectedMinute !== null) {
        const tripMinute = minuteOfDayFromDate(tripDepartAt);
        if (Math.abs(tripMinute - selectedMinute) > 120) {
          return false;
        }
      }

      return true;
    });

    return withFilters.sort((left, right) => {
      const leftTime = new Date(left.departAt).getTime();
      const rightTime = new Date(right.departAt).getTime();

      if (selectedMinute === null) {
        return leftTime - rightTime;
      }

      const leftDistance = Math.abs(minuteOfDayFromDate(new Date(left.departAt)) - selectedMinute);
      const rightDistance = Math.abs(
        minuteOfDayFromDate(new Date(right.departAt)) - selectedMinute
      );

      return leftDistance - rightDistance;
    });
  }, [fromLocation, travelDate, travelTime, trips]);

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
    try {
      await apiFetch(`/api/trips/${tripId}/request`, { method: 'POST' });
      await loadTrips(query);
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Could not request seat');
    }
  };

  const applyNowFilters = () => {
    const now = new Date();
    setTravelDate(toDateInputValue(now));
    setTravelTime(toTimeInputValue(now));
  };

  const clearFilters = () => {
    setTravelDate('');
    setTravelTime('');
  };

  return (
    <div className="space-y-3">
      <Card className="auth-hero-card overflow-hidden border-primary/20 bg-white">
        <div className="relative h-44 overflow-hidden border-b border-primary/15 bg-[linear-gradient(125deg,rgba(10,185,198,0.88)_0%,rgba(32,160,133,0.75)_35%,rgba(255,255,255,0.35)_65%,rgba(255,255,255,0.95)_100%)]">
          <div className="absolute left-6 top-6 rounded-full border border-white/70 bg-white/80 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-foreground">
            Car Pool Booking
          </div>
          <div className="absolute left-6 top-[5.2rem] w-[58%] rounded-[2rem] border-[3px] border-slate-900/75" />
          <span className="absolute left-[1.1rem] top-[4.6rem] flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-semibold text-slate-900">
            1
          </span>
          <span className="absolute left-[43%] top-[4.1rem] flex h-7 w-7 items-center justify-center rounded-full bg-orange-400 text-xs font-semibold text-slate-900">
            2
          </span>
          <span className="absolute right-[21%] top-[5rem] flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 text-xs font-semibold text-white">
            3
          </span>
          <div className="absolute bottom-4 right-5 rounded-2xl border border-slate-900/20 bg-white/85 px-3 py-2 text-xs font-semibold text-slate-700">
            Live PG2 commute lanes
          </div>
        </div>

        <CardContent className="space-y-4 p-4">
          <div>
            <p className="text-xl font-semibold leading-tight">Book your next Car Pool ride</p>
            <p className="text-sm text-muted-foreground">
              Mobile-first flow inspired by ride-hailing apps for PG2 residents.
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <LocateFixed className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                className="h-11 pl-9"
                value={fromLocation}
                onChange={(event) => setFromLocation(event.target.value)}
                placeholder="Pickup from"
              />
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-11 pl-9"
                placeholder="Where do you want to go?"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <DatePicker
              value={travelDate}
              onValueChange={setTravelDate}
              placeholder="Travel date"
              aria-label="Travel date"
            />
            <TimePicker
              value={travelTime}
              onValueChange={setTravelTime}
              step={300}
              placeholder="Travel time"
              aria-label="Travel time"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => loadTrips(query)}>Find Car Pool Rides</Button>
            <Button variant="outline" onClick={applyNowFilters}>
              Leave Now
            </Button>
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
              Clear Filters
            </Button>
          </div>

          {popularDestinations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {popularDestinations.map((destination) => (
                <button
                  key={destination}
                  type="button"
                  className="rounded-full border border-border bg-accent/45 px-3 py-1 text-xs font-medium text-foreground hover:bg-accent"
                  onClick={() => {
                    setQuery(destination);
                    void loadTrips(destination);
                  }}
                >
                  {destination}
                </button>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {loading ? <p className="text-sm text-muted-foreground">Loading rides...</p> : null}
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      {!loading && filteredTrips.length === 0 ? (
        <Card className="auth-hero-card">
          <CardContent className="space-y-2 p-5 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">No matching rides found</p>
            <p>Try another destination or clear your date/time filters.</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-2">
        {filteredTrips.map((trip) => {
          const isDriver = trip.driver.id === currentUserId;
          const request = trip.requests[0];
          const seatsLeft = Math.max(0, trip.seatsAvailable - trip.seatsBooked);

          const repeatLabel =
            trip.tripType === 'DAILY' && trip.repeatDays.length > 0
              ? trip.repeatDays.map((day) => repeatDayLabel[day] ?? day).join(', ')
              : 'Daily';

          return (
            <Card
              key={trip.id}
              className="auth-hero-card overflow-hidden border-border/80 bg-white"
            >
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={trip.tripType === 'ONE_TIME' ? 'secondary' : 'default'}>
                        {trip.tripType === 'ONE_TIME' ? 'One Time' : 'Daily'}
                      </Badge>
                      <span className="text-xs font-medium text-muted-foreground">
                        {trip.tripType === 'ONE_TIME'
                          ? formatDateTime(trip.departAt)
                          : `Repeats: ${repeatLabel}`}
                      </span>
                    </div>
                    <p className="text-lg font-semibold leading-tight">
                      {trip.fromLocation} to {trip.toLocation}
                    </p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {seatsLeft} seats
                  </div>
                </div>

                <div className="auth-tile space-y-2 p-3 text-sm">
                  <p className="inline-flex items-center gap-2 text-muted-foreground">
                    <MapPinned className="h-4 w-4 text-primary" />
                    {trip.route || 'Route details will be shared by the car owner'}
                  </p>
                  <p className="inline-flex items-center gap-2 text-muted-foreground">
                    <UsersRound className="h-4 w-4 text-primary" />
                    Car owner: {trip.driver.profile?.name ?? 'Resident'} (
                    {trip.driver.profile?.towerFlat ?? 'PG2'})
                  </p>
                  {trip.notes ? (
                    <p className="inline-flex items-start gap-2 text-muted-foreground">
                      <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                      Note: {trip.notes}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex min-h-10 flex-1 items-center rounded-xl border border-border px-3 text-xs text-muted-foreground">
                    <Clock3 className="mr-2 h-4 w-4 text-primary" />
                    On-time pickup expected
                  </div>
                  <div className="inline-flex min-h-10 items-center rounded-xl border border-border px-3 text-xs text-muted-foreground">
                    <CarFront className="mr-2 h-4 w-4 text-primary" />
                    Car Pool
                  </div>
                </div>

                {isDriver ? (
                  <Badge variant="outline">Your trip</Badge>
                ) : request ? (
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
                ) : (
                  <Button
                    onClick={() => requestSeat(trip.id)}
                    disabled={seatsLeft <= 0}
                    className="w-full"
                  >
                    {seatsLeft <= 0 ? 'No seats left' : 'Book this ride'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
