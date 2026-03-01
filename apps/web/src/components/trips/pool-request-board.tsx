'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimePicker } from '@/components/ui/time-picker';
import { combineDateAndTimeToIso, toDateInputValue, toTimeInputValue } from '@/lib/date-time';
import { apiFetch } from '@/lib/fetcher';
import { formatDateTime } from '@/lib/format';

type PoolRequest = {
  id: string;
  userId: string;
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

type PoolRequestBoardProps = {
  currentUserId: string;
  showComposer?: boolean;
  listTitle?: string;
  listDescription?: string;
  emptyStateText?: string;
};

export function PoolRequestBoard({
  currentUserId,
  showComposer = true,
  listTitle = 'Open passenger requests',
  listDescription = 'Browse posted pool requests from residents who need a seat.',
  emptyStateText = 'No open passenger requests.',
}: PoolRequestBoardProps) {
  const defaultTravel = new Date(Date.now() + 30 * 60 * 1000);
  const [from, setFrom] = useState('Panchsheel Greens 2');
  const [to, setTo] = useState('');
  const [route, setRoute] = useState('');
  const [travelDate, setTravelDate] = useState(toDateInputValue(defaultTravel));
  const [travelTime, setTravelTime] = useState(toTimeInputValue(defaultTravel));
  const [seatsNeeded, setSeatsNeeded] = useState('1');
  const [poolRequests, setPoolRequests] = useState<PoolRequest[]>([]);
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState('');
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
    const travelAtIso = combineDateAndTimeToIso(travelDate, travelTime);
    if (!travelAtIso) {
      setError('Please choose a valid travel date and time.');
      return;
    }

    setPosting(true);
    setError('');

    try {
      await apiFetch('/api/pool-requests', {
        method: 'POST',
        body: JSON.stringify({
          from,
          to,
          route,
          travelAtIso,
          seatsNeeded: Number(seatsNeeded),
        }),
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

  const onDelete = async (requestId: string) => {
    const confirmDelete = window.confirm('Delete this pool request?');
    if (!confirmDelete) {
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
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to delete pool request');
    } finally {
      setDeletingId('');
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
              <Label>From</Label>
              <Input value={from} onChange={(event) => setFrom(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input value={to} onChange={(event) => setTo(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Route (optional)</Label>
              <Input value={route} onChange={(event) => setRoute(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker value={travelDate} onValueChange={setTravelDate} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <TimePicker value={travelTime} onValueChange={setTravelTime} step={300} />
            </div>
            <div className="space-y-2">
              <Label>Seats needed</Label>
              <Input
                type="number"
                min={1}
                max={4}
                value={seatsNeeded}
                onChange={(event) => setSeatsNeeded(event.target.value)}
              />
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
          {poolRequests.map((item) => (
            <div
              key={item.id}
              className="auth-tile space-y-2 p-3 text-sm transition hover:bg-accent/60"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold leading-snug">
                  {item.fromLocation} → {item.toLocation}
                </p>
                {item.userId === currentUserId ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Delete
                  </Button>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{item.route || 'Route open'}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.travelAt)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Passenger: {item.user.profile?.name ?? 'Resident'} (
                {item.user.profile?.towerFlat ?? 'PG2'})
              </p>
              <p className="mt-2 inline-flex rounded-full border border-border bg-white px-2 py-1 text-[0.68rem] font-semibold text-foreground">
                Seats needed: {item.seatsNeeded}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
