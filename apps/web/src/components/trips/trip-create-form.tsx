'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TimePicker } from '@/components/ui/time-picker';
import { combineDateAndTimeToIso, toDateInputValue, toTimeInputValue } from '@/lib/date-time';
import { apiFetch } from '@/lib/fetcher';

export function TripCreateForm() {
  const router = useRouter();
  const defaultDeparture = new Date(Date.now() + 30 * 60 * 1000);
  const [tripType, setTripType] = useState<'DAILY' | 'ONE_TIME'>('DAILY');
  const [from, setFrom] = useState('Panchsheel Greens 2');
  const [route, setRoute] = useState('');
  const [to, setTo] = useState('');
  const [travelDate, setTravelDate] = useState(toDateInputValue(defaultDeparture));
  const [travelTime, setTravelTime] = useState(toTimeInputValue(defaultDeparture));
  const [seatsAvailable, setSeatsAvailable] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onCreate = async () => {
    const departAtIso = combineDateAndTimeToIso(travelDate, travelTime);
    if (!departAtIso) {
      setError('Please choose a valid travel date and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiFetch('/api/trips', {
        method: 'POST',
        body: JSON.stringify({
          tripType,
          from,
          route,
          to,
          departAtIso,
          seatsAvailable: Number(seatsAvailable),
          notes,
        }),
      });

      router.push('/dashboard/trips');
      router.refresh();
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="auth-hero-card">
      <CardHeader>
        <CardTitle>Post your trip</CardTitle>
        <CardDescription>
          One-time rides auto-hide after 1 hour. Daily rides remain visible until you cancel.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Trip Type</Label>
          <Select
            value={tripType}
            onChange={(event) => setTripType(event.target.value as 'DAILY' | 'ONE_TIME')}
          >
            <option value="DAILY">Daily Basis</option>
            <option value="ONE_TIME">One Time</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>From</Label>
          <Input value={from} onChange={(event) => setFrom(event.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>To</Label>
          <Input
            placeholder="Noida Sector 62 via NH24"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Route details</Label>
          <Input
            placeholder="Via Pari Chowk, sector roads, etc."
            value={route}
            onChange={(event) => setRoute(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Travel Date</Label>
          <DatePicker value={travelDate} onValueChange={setTravelDate} />
        </div>

        <div className="space-y-2">
          <Label>Travel Time</Label>
          <TimePicker value={travelTime} onValueChange={setTravelTime} step={300} />
        </div>

        <div className="space-y-2">
          <Label>No. of seats available</Label>
          <Input
            type="number"
            min={1}
            max={7}
            value={seatsAvailable}
            onChange={(event) => setSeatsAvailable(event.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Notes</Label>
          <Textarea
            placeholder="Pickup point, landmark, or timing flexibility"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        {error ? <p className="text-sm font-medium text-red-700 md:col-span-2">{error}</p> : null}

        <Button className="w-full md:col-span-2" onClick={onCreate} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Publish Trip
        </Button>
      </CardContent>
    </Card>
  );
}
