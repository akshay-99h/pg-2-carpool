import Link from 'next/link';

import { TripFeed } from '@/components/trips/trip-feed';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function TripsPage() {
  const user = await requireApprovedUser();

  return (
    <div className="space-y-3">
      <Card className="auth-hero-card">
        <CardContent className="flex items-center justify-between gap-3 p-5">
          <div>
            <p className="text-lg font-semibold">Book a Car Pool ride</p>
            <p className="text-sm text-muted-foreground">
              Uber-like booking flow for mobile with quick date and time filters.
            </p>
          </div>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/dashboard/trips/new">Post Trip</Link>
          </Button>
        </CardContent>
      </Card>
      <Button asChild className="w-full sm:hidden">
        <Link href="/dashboard/trips/new">Post Trip</Link>
      </Button>
      <TripFeed currentUserId={user.id} />
    </div>
  );
}
