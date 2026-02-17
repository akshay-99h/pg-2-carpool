import { createTripSchema } from '@/lib/schemas';
import { TripType, type Weekday } from '@prisma/client';
import { NextResponse } from 'next/server';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { ONE_TIME_TRIP_TTL_MS } from '@/lib/constants';
import { db } from '@/lib/db';

const TRIPS_PAGE_SIZE_DEFAULT = 20;
const TRIPS_PAGE_SIZE_MAX = 50;

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  if (user.approvalStatus !== 'APPROVED') {
    return forbidden('Account approval pending');
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const page = parsePositiveInteger(searchParams.get('page'), 1);
  const pageSize = Math.min(
    parsePositiveInteger(searchParams.get('pageSize'), TRIPS_PAGE_SIZE_DEFAULT),
    TRIPS_PAGE_SIZE_MAX
  );
  const skip = (page - 1) * pageSize;

  const textFilter = q
    ? {
        OR: [
          { fromLocation: { contains: q, mode: 'insensitive' as const } },
          { route: { contains: q, mode: 'insensitive' as const } },
          { toLocation: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : undefined;

  const where = {
    status: 'ACTIVE' as const,
    AND: [
      {
        OR: [
          { tripType: 'DAILY' as const },
          {
            tripType: 'ONE_TIME' as const,
            expiresAt: {
              gt: new Date(),
            },
          },
        ],
      },
      ...(textFilter ? [textFilter] : []),
    ],
  };

  const [trips, total] = await Promise.all([
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
          where: {
            riderId: user.id,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: pageSize,
    }),
    db.trip.count({ where }),
  ]);

  return NextResponse.json({
    trips: trips.map((trip) => ({
      ...trip,
      repeatDays: trip.repeatDays.map((item) => item.day),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  if (user.approvalStatus !== 'APPROVED') {
    return forbidden('Account approval pending');
  }

  try {
    const body = await request.json();
    const parsed = createTripSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const field =
        typeof firstIssue?.path?.[0] === 'string' ? (firstIssue.path[0] as string) : undefined;
      return NextResponse.json(
        {
          error: firstIssue?.message ?? 'Invalid trip data',
          field,
        },
        { status: 400 }
      );
    }

    const departAt = new Date(parsed.data.departAtIso);
    const repeatDays = parsed.data.tripType === TripType.DAILY ? parsed.data.repeatDays : [];
    const expiresAt =
      parsed.data.tripType === TripType.ONE_TIME
        ? new Date(Date.now() + ONE_TIME_TRIP_TTL_MS)
        : null;

    const trip = await db.trip.create({
      data: {
        driverId: user.id,
        tripType: parsed.data.tripType,
        fromLocation: parsed.data.from,
        route: parsed.data.route,
        toLocation: parsed.data.to,
        departAt,
        seatsAvailable: parsed.data.seatsAvailable,
        notes: parsed.data.notes,
        expiresAt,
        repeatDays: {
          create: repeatDays.map((day) => ({
            day: day as Weekday,
          })),
        },
      },
    });

    await logAudit({
      actorId: user.id,
      action: 'TRIP_CREATED',
      entity: 'trip',
      entityId: trip.id,
    });

    return NextResponse.json({ ok: true, trip });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}
