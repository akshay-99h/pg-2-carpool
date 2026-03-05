import { NextResponse } from 'next/server';
import { poolRequestSchema } from '@/lib/schemas';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function PATCH(
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
    const existing = await db.poolRequest.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const isOwnerOrAdmin = existing.userId === user.id || user.role === 'ADMIN';
    if (!isOwnerOrAdmin) {
      return forbidden('Only request owner/admin can edit pool request');
    }

    const body = await request.json();
    const parsed = poolRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const updated = await db.poolRequest.update({
      where: { id: requestId },
      data: {
        fromLocation: parsed.data.from,
        toLocation: parsed.data.to,
        route: parsed.data.route,
        travelAt: new Date(parsed.data.travelAtIso),
        seatsNeeded: parsed.data.seatsNeeded,
      },
    });

    await logAudit({
      actorId: user.id,
      action: 'POOL_REQUEST_UPDATED',
      entity: 'pool_request',
      entityId: requestId,
    });

    return NextResponse.json({ ok: true, poolRequest: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update pool request' }, { status: 500 });
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
    const existing = await db.poolRequest.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const isOwnerOrAdmin = existing.userId === user.id || user.role === 'ADMIN';
    if (!isOwnerOrAdmin) {
      return forbidden('Only request owner/admin can delete pool request');
    }

    await db.poolRequest.delete({
      where: { id: requestId },
    });

    await logAudit({
      actorId: user.id,
      action: 'POOL_REQUEST_DELETED',
      entity: 'pool_request',
      entityId: requestId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete pool request' }, { status: 500 });
  }
}
