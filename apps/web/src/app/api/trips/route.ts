import { createTripSchema } from '@/lib/schemas';
import { type Prisma, TripType, type Weekday } from '@prisma/client';
import { NextResponse } from 'next/server';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
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
  const from = searchParams.get('from')?.trim() || '';
  const travelDate = searchParams.get('travelDate')?.trim() || '';
  const travelTime = searchParams.get('travelTime')?.trim() || '';
  const page = parsePositiveInteger(searchParams.get('page'), 1);
  const pageSize = Math.min(
    parsePositiveInteger(searchParams.get('pageSize'), TRIPS_PAGE_SIZE_DEFAULT),
    TRIPS_PAGE_SIZE_MAX
  );
  const skip = (page - 1) * pageSize;
  const now = new Date();

  const andFilters: Prisma.TripWhereInput[] = [
    {
      OR: [
        { tripType: 'DAILY' as const },
        {
          tripType: 'ONE_TIME' as const,
          departAt: {
            gt: now,
          },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      ],
    },
  ];

  if (q) {
    andFilters.push({
      OR: [
        { fromLocation: { contains: q, mode: 'insensitive' } },
        { route: { contains: q, mode: 'insensitive' } },
        { toLocation: { contains: q, mode: 'insensitive' } },
      ],
    });
  }

  if (from) {
    andFilters.push({
      fromLocation: {
        contains: from,
        mode: 'insensitive',
      },
    });
  }

  if (travelDate) {
    const dayStart = new Date(`${travelDate}T00:00:00`);
    if (!Number.isNaN(dayStart.getTime())) {
      if (travelTime) {
        const selected = new Date(`${travelDate}T${travelTime}:00`);
        if (!Number.isNaN(selected.getTime())) {
          andFilters.push({
            departAt: {
              gte: new Date(selected.getTime() - 120 * 60 * 1000),
              lte: new Date(selected.getTime() + 120 * 60 * 1000),
            },
          });
        } else {
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);
          andFilters.push({
            departAt: {
              gte: dayStart,
              lt: dayEnd,
            },
          });
        }
      } else {
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        andFilters.push({
          departAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        });
      }
    }
  }

  const where = {
    status: 'ACTIVE' as const,
    AND: andFilters,
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
    const expiresAt = parsed.data.tripType === TripType.ONE_TIME ? departAt : null;

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
