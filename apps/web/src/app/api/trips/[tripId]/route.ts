import { NextResponse } from 'next/server';
import { TripType, type Weekday } from '@prisma/client';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { createTripSchema } from '@/lib/schemas';

async function getAuthorizedTrip(tripId: string, userId: string, userRole: 'USER' | 'ADMIN') {
  const existing = await db.trip.findUnique({
    where: { id: tripId },
    select: { id: true, driverId: true },
  });

  if (!existing) {
    return { error: NextResponse.json({ error: 'Trip not found' }, { status: 404 }) };
  }

  const isOwnerOrAdmin = existing.driverId === userId || userRole === 'ADMIN';
  if (!isOwnerOrAdmin) {
    return {
      error: forbidden('Only the trip owner or an admin can manage this trip'),
    };
  }

  return { existing };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  if (user.approvalStatus !== 'APPROVED') {
    return forbidden('Account approval pending');
  }

  const { tripId } = await params;

  try {
    const authorization = await getAuthorizedTrip(tripId, user.id, user.role);
    if ('error' in authorization) {
      return authorization.error;
    }

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

    const trip = await db.$transaction(async (tx) => {
      await tx.tripRepeatDay.deleteMany({
        where: { tripId },
      });

      return tx.trip.update({
        where: { id: tripId },
        data: {
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
        include: {
          repeatDays: {
            select: {
              day: true,
            },
          },
        },
      });
    });

    await logAudit({
      actorId: user.id,
      action: 'TRIP_UPDATED',
      entity: 'trip',
      entityId: tripId,
    });

    return NextResponse.json({
      ok: true,
      trip: {
        ...trip,
        repeatDays: trip.repeatDays.map((item) => item.day),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  if (user.approvalStatus !== 'APPROVED') {
    return forbidden('Account approval pending');
  }

  const { tripId } = await params;

  try {
    const authorization = await getAuthorizedTrip(tripId, user.id, user.role);
    if ('error' in authorization) {
      return authorization.error;
    }
    const { existing } = authorization;

    await db.trip.delete({
      where: { id: tripId },
    });

    await logAudit({
      actorId: user.id,
      action: 'TRIP_DELETED',
      entity: 'trip',
      entityId: tripId,
      metadata: {
        deletedByRole: user.role,
        tripOwnerId: existing.driverId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
  }
}
