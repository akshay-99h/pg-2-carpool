'use client';

import { Clock4, Search, UsersRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/fetcher';
import { formatDateTime } from '@/lib/format';

type Trip = {
  id: string;
  tripType: 'DAILY' | 'ONE_TIME';
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

  const requestSeat = async (tripId: string) => {
    try {
      await apiFetch(`/api/trips/${tripId}/request`, { method: 'POST' });
      await loadTrips(query);
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Could not request seat');
    }
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by place, route, or destination"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => loadTrips(query)}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? <p className="text-sm text-muted-foreground">Loading trips...</p> : null}
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      {!loading && trips.length === 0 ? (
        <Card>
          <CardContent className="pt-5 text-sm text-muted-foreground">
            No active trips found for this query.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-2">
        {trips.map((trip) => {
          const isDriver = trip.driver.id === currentUserId;
          const request = trip.requests[0];
          const seatsLeft = Math.max(0, trip.seatsAvailable - trip.seatsBooked);

          return (
            <Card key={trip.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base leading-snug">
                    {trip.fromLocation} → {trip.toLocation}
                  </CardTitle>
                  <Badge variant={trip.tripType === 'ONE_TIME' ? 'secondary' : 'default'}>
                    {trip.tripType === 'ONE_TIME' ? 'ONE TIME' : 'DAILY'}
                  </Badge>
                </div>
                <CardDescription>{trip.route || 'Route details not added yet'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid gap-2 rounded-xl border border-border bg-accent/45 p-3 sm:grid-cols-3">
                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                    <Clock4 className="h-3.5 w-3.5 text-primary" />
                    {formatDateTime(trip.departAt)}
                  </p>
                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                    <UsersRound className="h-3.5 w-3.5 text-primary" />
                    {seatsLeft} seats left
                  </p>
                  <p className="text-xs text-muted-foreground sm:text-right sm:text-sm">
                    {trip.driver.profile?.name ?? 'Resident'} (
                    {trip.driver.profile?.towerFlat ?? 'PG2'})
                  </p>
                </div>

                {trip.notes ? (
                  <p className="rounded-lg border border-border bg-white px-2.5 py-2 text-xs text-muted-foreground">
                    Note: {trip.notes}
                  </p>
                ) : null}

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
                  >
                    Booking {request.status}
                  </Badge>
                ) : (
                  <Button
                    onClick={() => requestSeat(trip.id)}
                    disabled={seatsLeft <= 0}
                    className="w-full"
                  >
                    {seatsLeft <= 0 ? 'No seats left' : 'Request Booking'}
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
