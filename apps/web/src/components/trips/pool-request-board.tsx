'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/fetcher';
import { formatDateTime } from '@/lib/format';

type PoolRequest = {
  id: string;
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

export function PoolRequestBoard() {
  const [from, setFrom] = useState('Panchsheel Greens 2');
  const [to, setTo] = useState('');
  const [route, setRoute] = useState('');
  const [travelAt, setTravelAt] = useState('');
  const [seatsNeeded, setSeatsNeeded] = useState('1');
  const [poolRequests, setPoolRequests] = useState<PoolRequest[]>([]);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    setError('');

    try {
      await apiFetch('/api/pool-requests', {
        method: 'POST',
        body: JSON.stringify({
          from,
          to,
          route,
          travelAtIso: new Date(travelAt).toISOString(),
          seatsNeeded: Number(seatsNeeded),
        }),
      });

      setTo('');
      setRoute('');
      setTravelAt('');
      setSeatsNeeded('1');
      await load();
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Failed to post request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="xl:sticky xl:top-6">
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
            <Label>Date and Time</Label>
            <Input
              type="datetime-local"
              value={travelAt}
              onChange={(event) => setTravelAt(event.target.value)}
            />
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
          <Button className="w-full" onClick={onPost} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Post Request
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open requests</CardTitle>
          <CardDescription>Recent rider demand from society members.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {poolRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open pool requests.</p>
          ) : null}
          {poolRequests.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-accent/45 p-3 text-sm transition hover:bg-accent/60"
            >
              <p className="font-semibold leading-snug">
                {item.fromLocation} → {item.toLocation}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{item.route || 'Route open'}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.travelAt)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.user.profile?.name ?? 'Resident'} ({item.user.profile?.towerFlat ?? 'PG2'})
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
