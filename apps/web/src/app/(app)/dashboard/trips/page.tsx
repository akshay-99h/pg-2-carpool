import Link from 'next/link';

import { TripFeed } from '@/components/trips/trip-feed';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function TripsPage({
  searchParams,
}: {
  searchParams?: Promise<{ posted?: string }>;
}) {
  const user = await requireApprovedUser();
  const params = searchParams ? await searchParams : undefined;
  const posted = params?.posted === '1';

  return (
    <div className="space-y-3">
      {posted ? (
        <Card className="border-emerald-300 bg-emerald-50">
          <CardContent className="p-4 text-sm font-medium text-emerald-900">
            Trip posted successfully.
          </CardContent>
        </Card>
      ) : null}
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
