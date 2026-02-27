import { addDays, format, startOfDay, subDays } from 'date-fns';
import Link from 'next/link';

import { AdminAnalyticsCharts } from '@/components/admin/admin-analytics-charts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/format';
import { requireAdminUser } from '@/server/auth-guards';

const TRIPS_PAGE_SIZE = 20;

const repeatDayLabel: Record<string, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function isTripCurrentlyActive(
  trip: {
    status: 'ACTIVE' | 'CANCELLED';
    tripType: 'DAILY' | 'ONE_TIME';
    departAt: Date;
    expiresAt: Date | null;
  },
  now: Date
) {
  if (trip.status !== 'ACTIVE') {
    return false;
  }

  if (trip.tripType === 'DAILY') {
    return true;
  }

  if (trip.departAt <= now) {
    return false;
  }

  return trip.expiresAt ? trip.expiresAt > now : true;
}

function summarizeRequestStatuses(
  requests: Array<{ status: 'PENDING' | 'CONFIRMED' | 'REJECTED' }>
) {
  let pending = 0;
  let confirmed = 0;
  let rejected = 0;

  for (const request of requests) {
    if (request.status === 'CONFIRMED') {
      confirmed += 1;
      continue;
    }
    if (request.status === 'REJECTED') {
      rejected += 1;
      continue;
    }
    pending += 1;
  }

  return {
    total: requests.length,
    pending,
    confirmed,
    rejected,
  };
}

function pageLink(page: number, query: string) {
  const params = new URLSearchParams();
  if (query) {
    params.set('q', query);
  }
  params.set('page', String(page));
  return `/admin/analytics?${params.toString()}`;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdminUser();

  const params = searchParams ? await searchParams : undefined;
  const query = params?.q?.trim() ?? '';
  const page = parsePositiveInteger(params?.page, 1);
  const skip = (page - 1) * TRIPS_PAGE_SIZE;
  const now = new Date();

  const where = query
    ? {
        OR: [
          { fromLocation: { contains: query, mode: 'insensitive' as const } },
          { route: { contains: query, mode: 'insensitive' as const } },
          { toLocation: { contains: query, mode: 'insensitive' as const } },
        ],
      }
    : undefined;

  const [analyticsTrips, totalUsers, pendingUsers, trips, totalTrips] = await Promise.all([
    db.trip.findMany({
      select: {
        tripType: true,
        status: true,
        fromLocation: true,
        toLocation: true,
        departAt: true,
        expiresAt: true,
        seatsAvailable: true,
        seatsBooked: true,
        createdAt: true,
        requests: {
          select: {
            status: true,
            createdAt: true,
          },
        },
      },
    }),
    db.user.count(),
    db.user.count({ where: { approvalStatus: 'PENDING' } }),
    db.trip.findMany({
      where,
      include: {
        driver: {
          include: {
            profile: true,
          },
        },
        repeatDays: {
          select: {
            day: true,
          },
        },
        requests: {
          orderBy: { createdAt: 'desc' },
          include: {
            rider: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: [{ departAt: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: TRIPS_PAGE_SIZE,
    }),
    db.trip.count({ where }),
  ]);

  let activeTrips = 0;
  let pastTrips = 0;
  let totalRequests = 0;
  let pendingRequests = 0;
  let confirmedRequests = 0;
  let rejectedRequests = 0;
  let totalSeatsOffered = 0;
  let totalSeatsBooked = 0;
  let dailyTrips = 0;
  let oneTimeTrips = 0;

  const routeStats = new Map<string, { route: string; trips: number; confirmed: number }>();

  const trendStart = startOfDay(subDays(now, 29));
  const trendMap = new Map<
    string,
    { date: string; trips: number; requests: number; confirmed: number }
  >();
  for (let index = 0; index < 30; index += 1) {
    const date = addDays(trendStart, index);
    const key = format(date, 'yyyy-MM-dd');
    trendMap.set(key, { date: format(date, 'dd MMM'), trips: 0, requests: 0, confirmed: 0 });
  }

  for (const trip of analyticsTrips) {
    if (isTripCurrentlyActive(trip, now)) {
      activeTrips += 1;
    } else {
      pastTrips += 1;
    }

    if (trip.tripType === 'DAILY') {
      dailyTrips += 1;
    } else {
      oneTimeTrips += 1;
    }

    totalSeatsOffered += trip.seatsAvailable;
    totalSeatsBooked += trip.seatsBooked;

    const route = `${trip.fromLocation} -> ${trip.toLocation}`;
    const existingRoute = routeStats.get(route) ?? { route, trips: 0, confirmed: 0 };
    existingRoute.trips += 1;
    routeStats.set(route, existingRoute);

    const tripDateKey = format(startOfDay(trip.createdAt), 'yyyy-MM-dd');
    const trendPoint = trendMap.get(tripDateKey);
    if (trendPoint) {
      trendPoint.trips += 1;
    }

    for (const request of trip.requests) {
      totalRequests += 1;
      if (request.status === 'CONFIRMED') {
        confirmedRequests += 1;
        existingRoute.confirmed += 1;
      } else if (request.status === 'REJECTED') {
        rejectedRequests += 1;
      } else {
        pendingRequests += 1;
      }

      const requestDateKey = format(startOfDay(request.createdAt), 'yyyy-MM-dd');
      const requestTrendPoint = trendMap.get(requestDateKey);
      if (requestTrendPoint) {
        requestTrendPoint.requests += 1;
        if (request.status === 'CONFIRMED') {
          requestTrendPoint.confirmed += 1;
        }
      }
    }
  }

  const confirmationRate =
    totalRequests > 0 ? Math.round((confirmedRequests / totalRequests) * 100) : 0;
  const seatFillRate =
    totalSeatsOffered > 0 ? Math.round((totalSeatsBooked / totalSeatsOffered) * 100) : 0;
  const trendData = Array.from(trendMap.values());
  const requestStatusData = [
    { name: 'Pending', value: pendingRequests },
    { name: 'Confirmed', value: confirmedRequests },
    { name: 'Rejected', value: rejectedRequests },
  ];
  const tripTypeData = [
    { name: 'Daily', value: dailyTrips },
    { name: 'One Time', value: oneTimeTrips },
  ];
  const topRoutesData = Array.from(routeStats.values())
    .sort((left, right) => {
      if (right.trips === left.trips) {
        return right.confirmed - left.confirmed;
      }
      return right.trips - left.trips;
    })
    .slice(0, 8);

  const totalPages = Math.max(1, Math.ceil(totalTrips / TRIPS_PAGE_SIZE));

  return (
    <div className="space-y-3">
      <Card className="auth-hero-card">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xl font-semibold">Executive Analytics</p>
              <p className="text-sm text-muted-foreground">
                Full admin visibility across active trips, past trips, and booking behavior.
              </p>
            </div>
            <Badge variant="outline">Admin Only</Badge>
          </div>
          <form className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
            <Input name="q" defaultValue={query} placeholder="Search route or location" />
            <Button type="submit">Search</Button>
            <Button asChild variant="outline">
              <Link href="/admin/analytics">Clear</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="auth-hero-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Trips</p>
            <p className="mt-2 text-2xl font-semibold">{analyticsTrips.length}</p>
          </CardContent>
        </Card>
        <Card className="auth-hero-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Active Trips</p>
            <p className="mt-2 text-2xl font-semibold">{activeTrips}</p>
          </CardContent>
        </Card>
        <Card className="auth-hero-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Past Trips</p>
            <p className="mt-2 text-2xl font-semibold">{pastTrips}</p>
          </CardContent>
        </Card>
        <Card className="auth-hero-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Bookings</p>
            <p className="mt-2 text-2xl font-semibold">{totalRequests}</p>
          </CardContent>
        </Card>
        <Card className="auth-hero-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Confirmation Rate
            </p>
            <p className="mt-2 text-2xl font-semibold">{confirmationRate}%</p>
          </CardContent>
        </Card>
        <Card className="auth-hero-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Seat Fill Rate</p>
            <p className="mt-2 text-2xl font-semibold">{seatFillRate}%</p>
          </CardContent>
        </Card>
        <Card className="auth-hero-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Users</p>
            <p className="mt-2 text-2xl font-semibold">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card className="auth-hero-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Pending Approvals
            </p>
            <p className="mt-2 text-2xl font-semibold">{pendingUsers}</p>
          </CardContent>
        </Card>
      </div>

      <AdminAnalyticsCharts
        trendData={trendData}
        requestStatusData={requestStatusData}
        tripTypeData={tripTypeData}
        topRoutesData={topRoutesData}
      />

      <Card className="auth-hero-card">
        <CardHeader>
          <CardTitle>All Trips (Past + Active)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trips.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trips found for this query.</p>
          ) : null}

          {trips.map((trip) => {
            const requestStats = summarizeRequestStatuses(trip.requests);
            const isCurrentlyActive = isTripCurrentlyActive(trip, now);
            const repeatLabel =
              trip.tripType === 'DAILY' && trip.repeatDays.length > 0
                ? trip.repeatDays.map((item) => repeatDayLabel[item.day] ?? item.day).join(', ')
                : 'Daily';
            const requestPreview = trip.requests.slice(0, 4);
            const moreCount = Math.max(0, trip.requests.length - requestPreview.length);

            return (
              <div key={trip.id} className="auth-tile space-y-3 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={trip.tripType === 'DAILY' ? 'default' : 'secondary'}>
                        {trip.tripType === 'DAILY' ? 'Daily' : 'One Time'}
                      </Badge>
                      <Badge variant={isCurrentlyActive ? 'success' : 'outline'}>
                        {isCurrentlyActive ? 'ACTIVE' : 'PAST'}
                      </Badge>
                      {trip.status !== 'ACTIVE' ? <Badge variant="danger">CANCELLED</Badge> : null}
                    </div>
                    <p className="text-sm font-semibold">
                      {trip.fromLocation} {'->'} {trip.toLocation}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {trip.tripType === 'DAILY'
                        ? `Repeats: ${repeatLabel} at ${trip.departAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                        : `Departure: ${formatDateTime(trip.departAt)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Driver: {trip.driver.profile?.name ?? 'Resident'} (
                      {trip.driver.email ?? 'No email'})
                    </p>
                  </div>
                  <div className="grid min-w-52 gap-1 rounded-xl border border-border/70 bg-white p-2 text-xs">
                    <p>
                      Seats: <span className="font-semibold">{trip.seatsBooked}</span> booked /{' '}
                      <span className="font-semibold">{trip.seatsAvailable}</span> offered
                    </p>
                    <p>
                      Requests: <span className="font-semibold">{requestStats.total}</span> total
                    </p>
                    <p className="text-muted-foreground">
                      P: {requestStats.pending} | C: {requestStats.confirmed} | R:{' '}
                      {requestStats.rejected}
                    </p>
                  </div>
                </div>

                {trip.notes ? (
                  <p className="text-xs text-muted-foreground">Note: {trip.notes}</p>
                ) : null}

                <div className="space-y-2 rounded-xl border border-border/70 bg-white p-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Booking Details
                  </p>
                  {requestPreview.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No booking requests yet.</p>
                  ) : (
                    requestPreview.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 py-1.5 text-xs last:border-b-0"
                      >
                        <p>
                          {request.rider.profile?.name ?? 'Resident'} (
                          {request.rider.profile?.towerFlat ?? 'PG2'})
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              request.status === 'CONFIRMED'
                                ? 'success'
                                : request.status === 'REJECTED'
                                  ? 'danger'
                                  : 'warning'
                            }
                          >
                            {request.status}
                          </Badge>
                          <span className="text-muted-foreground">
                            {formatDateTime(request.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  {moreCount > 0 ? (
                    <p className="text-xs text-muted-foreground">+ {moreCount} more requests</p>
                  ) : null}
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>
              Page {page} of {totalPages} ({totalTrips} trips)
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={pageLink(page - 1, query)}>Previous</Link>
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled>
                  Previous
                </Button>
              )}
              {page < totalPages ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={pageLink(page + 1, query)}>Next</Link>
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled>
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
