import { TripRequestStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

const schema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED']).optional(),
  note: z.string().max(240).optional(),
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

    if (!parsed.success || (!parsed.data.status && parsed.data.note === undefined)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const existing = await db.tripRequest.findUnique({
      where: { id: requestId },
      include: { trip: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const isDriverOrAdmin = existing.trip.driverId === user.id || user.role === 'ADMIN';
    const isRiderOrAdmin = existing.riderId === user.id || user.role === 'ADMIN';
    const hasStatusUpdate = Boolean(parsed.data.status);
    const hasNoteUpdate = parsed.data.note !== undefined;

    if (hasStatusUpdate && hasNoteUpdate) {
      return NextResponse.json(
        { error: 'Update booking status and note in separate actions' },
        { status: 400 }
      );
    }

    if (hasStatusUpdate) {
      if (!isDriverOrAdmin) {
        return forbidden('Only driver/admin can update request status');
      }

      if (
        parsed.data.status === TripRequestStatus.CONFIRMED &&
        existing.status !== TripRequestStatus.CONFIRMED &&
        existing.trip.seatsBooked >= existing.trip.seatsAvailable
      ) {
        return NextResponse.json({ error: 'No seats available' }, { status: 400 });
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
          parsed.data.status !== TripRequestStatus.CONFIRMED &&
          existing.trip.seatsBooked > 0
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
    }

    if (!isRiderOrAdmin) {
      return forbidden('Only rider/admin can edit booking note');
    }

    if (user.role !== 'ADMIN' && existing.status !== TripRequestStatus.PENDING) {
      return NextResponse.json(
        { error: 'Only pending bookings can be edited by riders' },
        { status: 400 }
      );
    }

    const updated = await db.tripRequest.update({
      where: { id: requestId },
      data: {
        note: parsed.data.note,
      },
    });

    await logAudit({
      actorId: user.id,
      action: 'TRIP_REQUEST_NOTE_UPDATED',
      entity: 'trip_request',
      entityId: updated.id,
    });

    return NextResponse.json({ ok: true, request: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  const { requestId } = await params;

  try {
    const existing = await db.tripRequest.findUnique({
      where: { id: requestId },
      include: { trip: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const isRiderOrAdmin = existing.riderId === user.id || user.role === 'ADMIN';
    if (!isRiderOrAdmin) {
      return forbidden('Only rider/admin can delete booking');
    }

    await db.$transaction(async (tx) => {
      await tx.tripRequest.delete({ where: { id: requestId } });

      if (existing.status === TripRequestStatus.CONFIRMED && existing.trip.seatsBooked > 0) {
        await tx.trip.update({
          where: { id: existing.tripId },
          data: {
            seatsBooked: {
              decrement: 1,
            },
          },
        });
      }
    });

    await logAudit({
      actorId: user.id,
      action: 'TRIP_REQUEST_DELETED',
      entity: 'trip_request',
      entityId: requestId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}
