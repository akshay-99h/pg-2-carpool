import { CarTaxiFront, Clock4, ShieldCheck, UserRoundSearch } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function DashboardHomePage() {
  const user = await requireApprovedUser();

  const [activeTrips, openPoolRequests, myTripCount] = await Promise.all([
    db.trip.count({
      where: {
        status: 'ACTIVE',
        OR: [{ tripType: 'DAILY' }, { tripType: 'ONE_TIME', expiresAt: { gt: new Date() } }],
      },
    }),
    db.poolRequest.count({ where: { status: 'OPEN' } }),
    db.trip.count({ where: { driverId: user.id, status: 'ACTIVE' } }),
  ]);

  const stats = [
    { label: 'Active Trips', value: activeTrips, icon: CarTaxiFront },
    { label: 'Pool Requests', value: openPoolRequests, icon: UserRoundSearch },
    { label: 'My Trips', value: myTripCount, icon: Clock4 },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 p-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Badge className="status-pill w-fit px-2.5 py-1">Live Board</Badge>
              <CardTitle className="text-2xl md:text-[1.95rem]">
                Daily commute control center
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track open trips, rider demand, and your own activity from one place.
              </p>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border bg-accent/55 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-accent/35 p-3">
            <p className="text-sm font-semibold">Quick actions</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <Button asChild className="w-full justify-start">
                <Link href="/dashboard/trips/new">Post Trip</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/trips">Find Ride</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/pool-requests">Post Pool Request</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/bookings">Booking Confirmations</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/contact">Contact Us</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/summary">Project Summary</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3 text-sm">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
            <p>
              Private vehicle sharing only for expense split. Commercial usage is not allowed. All
              members must be verified residents.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
