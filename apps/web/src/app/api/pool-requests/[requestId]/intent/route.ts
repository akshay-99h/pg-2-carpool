import { Prisma, TripRequestInitiatedBy } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

const schema = z.object({
  tripId: z.string().uuid(),
  note: z.string().max(240).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  if (user.approvalStatus !== 'APPROVED') {
    return forbidden('Account approval pending');
  }

  const { requestId } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message ?? 'Invalid payload' },
        { status: 400 }
      );
    }

    const poolRequest = await db.poolRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });

    if (!poolRequest || poolRequest.status !== 'OPEN') {
      return NextResponse.json({ error: 'Pool request not found' }, { status: 404 });
    }

    if (poolRequest.userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot send intent to your own request' },
        { status: 400 }
      );
    }

    const trip = await db.trip.findUnique({
      where: { id: parsed.data.tripId },
      select: {
        id: true,
        tripType: true,
        driverId: true,
        status: true,
        departAt: true,
        expiresAt: true,
        seatsAvailable: true,
        seatsBooked: true,
      },
    });

    if (!trip || trip.driverId !== user.id || trip.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'You can only use your own active trip' }, { status: 400 });
    }

    const now = new Date();
    const oneTimeTripEnded =
      trip.tripType === 'ONE_TIME' &&
      (trip.departAt <= now || (trip.expiresAt ? trip.expiresAt <= now : false));

    if (oneTimeTripEnded) {
      return NextResponse.json({ error: 'Selected trip has already ended' }, { status: 400 });
    }

    if (trip.seatsBooked >= trip.seatsAvailable) {
      return NextResponse.json({ error: 'No seats available in selected trip' }, { status: 400 });
    }

    const created = await db.tripRequest.create({
      data: {
        tripId: trip.id,
        riderId: poolRequest.userId,
        note: parsed.data.note,
        initiatedBy: TripRequestInitiatedBy.DRIVER,
        sourcePoolRequestId: poolRequest.id,
      },
    });

    await logAudit({
      actorId: user.id,
      action: 'POOL_REQUEST_INTENT_SENT',
      entity: 'trip_request',
      entityId: created.id,
      metadata: {
        poolRequestId: poolRequest.id,
        tripId: trip.id,
      },
    });

    return NextResponse.json({ ok: true, request: created });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A booking request already exists for this passenger on the selected trip' },
        { status: 409 }
      );
    }

    console.error(error);
    return NextResponse.json({ error: 'Failed to send booking intent' }, { status: 500 });
  }
}
