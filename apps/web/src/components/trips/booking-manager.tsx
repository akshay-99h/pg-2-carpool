'use client';

import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/fetcher';
import { formatDateTime } from '@/lib/format';

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
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  trip: {
    fromLocation: string;
    toLocation: string;
    departAt: string;
    driver: {
      profile?: {
        name: string;
      } | null;
    };
  };
};

export function BookingManager() {
  const [incoming, setIncoming] = useState<IncomingRequest[]>([]);
  const [outgoing, setOutgoing] = useState<OutgoingRequest[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await apiFetch<{ incoming: IncomingRequest[]; outgoing: OutgoingRequest[] }>(
        '/api/trip-requests'
      );
      setIncoming(response.incoming);
      setOutgoing(response.outgoing);
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to load bookings');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (requestId: string, status: 'CONFIRMED' | 'REJECTED') => {
    try {
      await apiFetch(`/api/trip-requests/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to update booking');
    }
  };

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      <div className="grid gap-3 xl:grid-cols-2">
        <Card>
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
              <div
                key={item.id}
                className="space-y-2 rounded-xl border border-border bg-accent/45 p-3 text-sm"
              >
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
                      <Button size="sm" onClick={() => updateStatus(item.id, 'CONFIRMED')}>
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(item.id, 'REJECTED')}
                      >
                        Reject
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your booking requests</CardTitle>
            <p className="text-sm text-muted-foreground">Track status of seat requests you sent.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {outgoing.length === 0 ? (
              <p className="text-sm text-muted-foreground">You have not requested any seats yet.</p>
            ) : null}
            {outgoing.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-accent/45 p-3 text-sm"
              >
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
                  Driver: {item.trip.driver.profile?.name ?? 'Resident'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
