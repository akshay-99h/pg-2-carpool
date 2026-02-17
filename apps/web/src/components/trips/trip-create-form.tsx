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
import { createTripSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

type TripFormField =
  | 'tripType'
  | 'from'
  | 'route'
  | 'to'
  | 'departAtIso'
  | 'seatsAvailable'
  | 'notes';

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
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<TripFormField, string>>>({});

  const requiredStar = <span className="ml-1 text-red-600">*</span>;

  const onCreate = async () => {
    const departAtIso = combineDateAndTimeToIso(travelDate, travelTime);
    if (!departAtIso) {
      setError('Please choose a valid travel date and time');
      setFieldErrors((previous) => ({ ...previous, departAtIso: 'Travel date/time is required' }));
      return;
    }

    const parsed = createTripSchema.safeParse({
      tripType,
      from: from.trim(),
      route: route.trim(),
      to: to.trim(),
      departAtIso,
      seatsAvailable: Number(seatsAvailable),
      notes: notes.trim() || undefined,
    });

    if (!parsed.success) {
      const nextErrors: Partial<Record<TripFormField, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as TripFormField | undefined;
        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      setError('Please fix the highlighted fields.');
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      await apiFetch('/api/trips', {
        method: 'POST',
        body: JSON.stringify({
          ...parsed.data,
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
          <Label>
            Trip Type
            {requiredStar}
          </Label>
          <Select
            value={tripType}
            onChange={(event) => setTripType(event.target.value as 'DAILY' | 'ONE_TIME')}
            className={cn(fieldErrors.tripType ? 'border-red-500 ring-1 ring-red-300' : '')}
          >
            <option value="DAILY">Daily Basis</option>
            <option value="ONE_TIME">One Time</option>
          </Select>
          {fieldErrors.tripType ? (
            <p className="text-xs text-red-700">{fieldErrors.tripType}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>
            From
            {requiredStar}
          </Label>
          <Input
            className={cn(
              'placeholder:text-muted-foreground/60',
              fieldErrors.from ? 'border-red-500 ring-1 ring-red-300' : ''
            )}
            placeholder="For example: Panchsheel Greens 2, Gate 2"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
          {fieldErrors.from ? <p className="text-xs text-red-700">{fieldErrors.from}</p> : null}
        </div>

        <div className="space-y-2">
          <Label>
            To
            {requiredStar}
          </Label>
          <Input
            className={cn(
              'placeholder:text-muted-foreground/60',
              fieldErrors.to ? 'border-red-500 ring-1 ring-red-300' : ''
            )}
            placeholder="For example: Noida Sector 62 (via NH24)"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
          {fieldErrors.to ? <p className="text-xs text-red-700">{fieldErrors.to}</p> : null}
        </div>

        <div className="space-y-2">
          <Label>
            Route details
            {requiredStar}
          </Label>
          <Input
            className={cn(
              'placeholder:text-muted-foreground/60',
              fieldErrors.route ? 'border-red-500 ring-1 ring-red-300' : ''
            )}
            placeholder="For example: Via Pari Chowk, Knowledge Park"
            value={route}
            onChange={(event) => setRoute(event.target.value)}
          />
          {fieldErrors.route ? <p className="text-xs text-red-700">{fieldErrors.route}</p> : null}
        </div>

        <div className="space-y-2">
          <Label>
            Travel Date
            {requiredStar}
          </Label>
          <DatePicker
            value={travelDate}
            onValueChange={setTravelDate}
            className={cn(fieldErrors.departAtIso ? 'border-red-500 ring-1 ring-red-300' : '')}
          />
        </div>

        <div className="space-y-2">
          <Label>
            Travel Time
            {requiredStar}
          </Label>
          <TimePicker
            value={travelTime}
            onValueChange={setTravelTime}
            step={300}
            className={cn(fieldErrors.departAtIso ? 'border-red-500 ring-1 ring-red-300' : '')}
          />
          {fieldErrors.departAtIso ? (
            <p className="text-xs text-red-700">{fieldErrors.departAtIso}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>
            No. of seats available
            {requiredStar}
          </Label>
          <Input
            type="number"
            min={1}
            max={7}
            className={cn(fieldErrors.seatsAvailable ? 'border-red-500 ring-1 ring-red-300' : '')}
            value={seatsAvailable}
            onChange={(event) => setSeatsAvailable(event.target.value)}
          />
          {fieldErrors.seatsAvailable ? (
            <p className="text-xs text-red-700">{fieldErrors.seatsAvailable}</p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Notes</Label>
          <Textarea
            className={cn(
              'placeholder:text-muted-foreground/60',
              fieldErrors.notes ? 'border-red-500 ring-1 ring-red-300' : ''
            )}
            placeholder="For example: Pickup near main gate at 8:10 AM"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          {fieldErrors.notes ? <p className="text-xs text-red-700">{fieldErrors.notes}</p> : null}
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
