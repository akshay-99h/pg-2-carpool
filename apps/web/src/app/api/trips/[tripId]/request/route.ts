import { NextResponse } from 'next/server';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  if (user.approvalStatus !== 'APPROVED') {
    return forbidden('Account approval pending');
  }

  const { tripId } = await params;

  try {
    const trip = await db.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const now = new Date();
    const oneTimeTripEnded =
      trip.tripType === 'ONE_TIME' &&
      (trip.departAt <= now || (trip.expiresAt ? trip.expiresAt <= now : false));
    if (oneTimeTripEnded) {
      return NextResponse.json({ error: 'Trip has already ended' }, { status: 400 });
    }

    if (trip.driverId === user.id) {
      return NextResponse.json({ error: 'Cannot request own trip' }, { status: 400 });
    }

    if (trip.seatsBooked >= trip.seatsAvailable) {
      return NextResponse.json({ error: 'No seats available' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const note = typeof body.note === 'string' ? body.note : undefined;

    const created = await db.tripRequest.create({
      data: {
        tripId,
        riderId: user.id,
        note,
      },
    });

    await logAudit({
      actorId: user.id,
      action: 'TRIP_REQUESTED',
      entity: 'trip_request',
      entityId: created.id,
      metadata: { tripId },
    });

    return NextResponse.json({ ok: true, request: created });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Request could not be created' }, { status: 500 });
  }
}
