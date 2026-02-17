'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

export function BookingManager() {
  const [incoming, setIncoming] = useState<IncomingRequest[]>([]);
  const [outgoing, setOutgoing] = useState<OutgoingRequest[]>([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const response = await apiFetch<{ incoming: IncomingRequest[]; outgoing: OutgoingRequest[] }>(
        '/api/trip-requests'
      );
      setIncoming(response.incoming);
      setOutgoing(response.outgoing);
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
            <CardTitle>Your booking requests</CardTitle>
            <p className="text-sm text-muted-foreground">Track status of seat requests you sent.</p>
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
    </div>
  );
}
