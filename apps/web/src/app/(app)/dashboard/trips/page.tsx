import { Plus } from 'lucide-react';
import Link from 'next/link';

import { TripFeed } from '@/components/trips/trip-feed';
import { TripPostedToast } from '@/components/trips/trip-posted-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { requireApprovedUser } from '@/server/auth-guards';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trips',
};

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
      <TripPostedToast />
      {posted ? (
        <Card className="border-emerald-300 bg-emerald-50">
          <CardContent className="p-4 text-sm font-medium text-emerald-900">
            Trip posted successfully.
          </CardContent>
        </Card>
      ) : null}
      {/* One heading row, one action. The old marketing card plus a duplicated
          mobile-only button pushed the ride list far down the screen. */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-xl font-semibold tracking-tight">Rides</h1>
        <Button asChild size="sm">
          <Link href="/dashboard/trips/new">
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            Post Trip
          </Link>
        </Button>
      </div>
      <TripFeed currentUserId={user.id} currentUserRole={user.role} />
    </div>
  );
}
