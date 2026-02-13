import { TripRequestStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

const schema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED']),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  const { requestId } = await params;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const existing = await db.tripRequest.findUnique({
      where: { id: requestId },
      include: { trip: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existing.trip.driverId !== user.id && user.role !== 'ADMIN') {
      return forbidden('Only driver/admin can update request');
    }

    const updated = await db.$transaction(async (tx) => {
      const updatedRequest = await tx.tripRequest.update({
        where: { id: requestId },
        data: {
          status: parsed.data.status,
        },
      });

      if (
        parsed.data.status === TripRequestStatus.CONFIRMED &&
        existing.status !== TripRequestStatus.CONFIRMED
      ) {
        await tx.trip.update({
          where: { id: existing.tripId },
          data: {
            seatsBooked: {
              increment: 1,
            },
          },
        });
      }

      if (
        existing.status === TripRequestStatus.CONFIRMED &&
        parsed.data.status !== TripRequestStatus.CONFIRMED
      ) {
        await tx.trip.update({
          where: { id: existing.tripId },
          data: {
            seatsBooked: {
              decrement: 1,
            },
          },
        });
      }

      return updatedRequest;
    });

    await logAudit({
      actorId: user.id,
      action: 'TRIP_REQUEST_UPDATED',
      entity: 'trip_request',
      entityId: updated.id,
      metadata: { status: updated.status },
    });

    return NextResponse.json({ ok: true, request: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
