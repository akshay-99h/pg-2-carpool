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

import { Card, CardContent } from '@/components/ui/card';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { requireApprovedUser } from '@/server/auth-guards';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

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

  // The two things residents actually come here to do, given prominence over
  // the rest of the grid.
  const primaryActions = [
    {
      href: '/dashboard/trips/new',
      label: 'Post a Trip',
      detail: 'Offer seats on your commute',
      icon: CarTaxiFront,
    },
    {
      href: '/dashboard/trips',
      label: 'Find a Ride',
      detail: 'Browse live trips and request a seat',
      icon: Search,
    },
  ];

  const secondaryActions = [
    { href: '/dashboard/bookings', label: 'My Bookings', icon: MapPinned },
    { href: '/dashboard/pool-requests', label: 'Post Pool Request', icon: UserRoundSearch },
    { href: '/dashboard/find-rider', label: 'Find Passenger', icon: UserRoundSearch },
    { href: '/dashboard/contact', label: 'Contact us', icon: Mail },
  ];

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Dashboard</h1>

      {/* Actions first: the counters below are context, not the reason anyone
          opens this screen. */}
      <div className="grid gap-3 sm:grid-cols-2">
        {primaryActions.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/[0.06] p-4 transition hover:border-primary/40 hover:bg-primary/10"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-base font-semibold leading-tight text-foreground">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{item.detail}</span>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {secondaryActions.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="surface-inset group flex min-h-[3.5rem] items-center gap-2.5 rounded-xl p-3 transition hover:border-primary/35 hover:bg-white"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-sm font-medium leading-tight text-foreground">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Counters compressed to a single row - same information, a third of the
          vertical space the old stat cards took. */}
      <Card>
        <CardContent className="grid grid-cols-3 gap-2 p-3">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex flex-col items-center gap-1 px-1 text-center">
                <span
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full',
                    item.chipClass
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="text-lg font-semibold leading-none tracking-tight">
                  {item.value}
                </span>
                <span className="text-[0.68rem] leading-tight text-muted-foreground">
                  {item.label}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        Private vehicle sharing only for expense split. Commercial usage is not allowed. All members
        must be verified residents.
      </p>
    </div>
  );
}
