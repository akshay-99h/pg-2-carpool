import {
  CarTaxiFront,
  Clock4,
  Mail,
  MapPinned,
  Search,
  ShieldCheck,
  UserRoundSearch,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function DashboardHomePage() {
  const user = await requireApprovedUser();
  const now = new Date();

  const [activeTrips, openPoolRequests, myTripCount] = await Promise.all([
    db.trip.count({
      where: {
        status: 'ACTIVE',
        OR: [
          { tripType: 'DAILY' },
          {
            tripType: 'ONE_TIME',
            departAt: { gt: now },
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        ],
      },
    }),
    db.poolRequest.count({ where: { status: 'OPEN' } }),
    db.trip.count({ where: { driverId: user.id, status: 'ACTIVE' } }),
  ]);

  const stats = [
    {
      label: 'Active Trips',
      value: activeTrips,
      icon: CarTaxiFront,
      chipClass: 'bg-primary/10 text-primary',
    },
    {
      label: 'Pool Requests',
      value: openPoolRequests,
      icon: UserRoundSearch,
      chipClass: 'bg-sky-100 text-sky-700',
    },
    {
      label: 'My Trips',
      value: myTripCount,
      icon: Clock4,
      chipClass: 'bg-amber-100 text-amber-700',
    },
  ];

  const quickActions = [
    { href: '/dashboard/trips/new', label: 'Post Trip', icon: CarTaxiFront },
    { href: '/dashboard/pool-requests', label: 'Post Pool Request', icon: UserRoundSearch },
    { href: '/dashboard/trips', label: 'Find Ride', icon: Search },
    { href: '/dashboard/find-rider', label: 'Find Passenger', icon: UserRoundSearch },
    { href: '/dashboard/bookings', label: 'My Bookings', icon: MapPinned },
    { href: '/dashboard/contact', label: 'Contact us', icon: Mail },
  ];

  return (
    <div className="space-y-5">
      <Card className="surface-raised">
        <CardContent className="space-y-5 p-5">
          <div className="space-y-2">
            <Badge variant="outline" className="status-chip w-fit px-2.5 py-1">
              Live Board
            </Badge>
            <CardTitle className="text-2xl md:text-[2rem]">Daily commute control center</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track open trips, rider demand, and your own activity from one clean dashboard.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="surface-inset rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <span
                      className={cn(
                        'inline-flex h-8 w-8 items-center justify-center rounded-full',
                        item.chipClass
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-lg">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="surface-inset group flex min-h-[88px] items-center gap-3 rounded-2xl p-3 transition hover:border-primary/35 hover:bg-white"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold leading-tight text-foreground">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="surface-inset flex items-start gap-3 rounded-2xl p-3 text-sm">
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
