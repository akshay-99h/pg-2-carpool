import type { Weekday } from '@prisma/client';
import { NextResponse } from 'next/server';

import { getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

const allowedDays = new Set(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const day = (searchParams.get('day') ?? '').trim().toUpperCase();
  const q = searchParams.get('q')?.trim() || '';

  const textFilter = q
    ? {
        OR: [
          { fromLocation: { contains: q, mode: 'insensitive' as const } },
          { route: { contains: q, mode: 'insensitive' as const } },
          { toLocation: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : undefined;

  const hasDayFilter = day && allowedDays.has(day);

  const rides = await db.trip.findMany({
    where: {
      status: 'ACTIVE',
      tripType: 'DAILY',
      repeatDays: {
        some: hasDayFilter ? { day: day as Weekday } : {},
      },
      ...(textFilter ? { AND: [textFilter] } : {}),
    },
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
    },
    orderBy: [{ departAt: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({
    rides: rides.map((ride) => ({
      id: ride.id,
      tripType: ride.tripType,
      repeatDays: ride.repeatDays.map((item) => item.day),
      fromLocation: ride.fromLocation,
      route: ride.route,
      toLocation: ride.toLocation,
      departAt: ride.departAt,
      seatsAvailable: ride.seatsAvailable,
      seatsBooked: ride.seatsBooked,
      notes: ride.notes,
      driver: {
        id: ride.driver.id,
        profile: ride.driver.profile
          ? {
              name: ride.driver.profile.name,
              towerFlat: ride.driver.profile.towerFlat,
              mobileNumber: ride.driver.profile.mobileNumber,
            }
          : null,
      },
    })),
  });
}
