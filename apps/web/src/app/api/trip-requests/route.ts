import { NextResponse } from 'next/server';

import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }
  if (user.approvalStatus !== 'APPROVED') {
    return forbidden('Account approval pending');
  }

  const [incoming, outgoing, myTrips] = await Promise.all([
    db.tripRequest.findMany({
      where: {
        trip: {
          driverId: user.id,
        },
      },
      include: {
        rider: {
          include: { profile: true },
        },
        trip: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.tripRequest.findMany({
      where: {
        riderId: user.id,
      },
      include: {
        trip: {
          include: {
            driver: {
              include: { profile: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.trip.findMany({
      where: {
        driverId: user.id,
      },
      include: {
        repeatDays: {
          select: {
            day: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({
    incoming,
    outgoing,
    myTrips: myTrips.map((trip) => ({
      ...trip,
      repeatDays: trip.repeatDays.map((item) => item.day),
    })),
  });
}
