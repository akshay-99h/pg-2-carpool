'use client';

import { AlertCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RouteMap() {
  const [from, setFrom] = useState('Panchsheel Greens 2, Greater Noida');
  const [to, setTo] = useState('Noida Sector 62');
  const [mode, setMode] = useState<'driving' | 'transit'>('driving');
  const hasGoogleMapsKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  const mapSrc = useMemo(() => {
    const origin = encodeURIComponent(from);
    const destination = encodeURIComponent(to);
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (key) {
      return `https://www.google.com/maps/embed/v1/directions?key=${key}&origin=${origin}&destination=${destination}&mode=${mode}`;
    }
    return `https://www.google.com/maps?q=${origin}%20to%20${destination}&output=embed`;
  }, [from, mode, to]);

  return (
    <div className="grid gap-3 lg:grid-cols-[340px_1fr] lg:items-start">
      <Card className="auth-hero-card lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Route map</CardTitle>
          <p className="text-sm text-muted-foreground">
            Adjust start and destination before posting your trip.
          </p>
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
          <div className="flex gap-2">
            <Button
              variant={mode === 'driving' ? 'default' : 'outline'}
              onClick={() => setMode('driving')}
              disabled={!hasGoogleMapsKey}
            >
              Driving
            </Button>
            <Button
              variant={mode === 'transit' ? 'default' : 'outline'}
              onClick={() => setMode('transit')}
              disabled={!hasGoogleMapsKey}
            >
              Transit
            </Button>
          </div>
          {!hasGoogleMapsKey ? (
            <div className="surface-inset rounded-xl p-2.5 text-xs text-muted-foreground">
              <p className="inline-flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 text-amber-600" />
                Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in <code>apps/web/.env</code> to
                enable mode-specific driving and transit routes.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="auth-hero-card">
        <CardContent className="p-0">
          <iframe
            title="Route map"
            className="h-[380px] w-full rounded-[1.35rem] lg:h-[560px]"
            loading="lazy"
            allowFullScreen
            src={mapSrc}
          />
        </CardContent>
      </Card>
    </div>
  );
}
