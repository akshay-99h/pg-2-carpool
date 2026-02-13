import { poolRequestSchema } from '@/lib/schemas';
import { NextResponse } from 'next/server';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  const poolRequests = await db.poolRequest.findMany({
    orderBy: { travelAt: 'asc' },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  return NextResponse.json({ poolRequests });
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
    const parsed = poolRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const created = await db.poolRequest.create({
      data: {
        userId: user.id,
        fromLocation: parsed.data.from,
        toLocation: parsed.data.to,
        route: parsed.data.route,
        travelAt: new Date(parsed.data.travelAtIso),
        seatsNeeded: parsed.data.seatsNeeded,
      },
    });

    await logAudit({
      actorId: user.id,
      action: 'POOL_REQUEST_CREATED',
      entity: 'pool_request',
      entityId: created.id,
    });

    return NextResponse.json({ ok: true, poolRequest: created });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to post request' }, { status: 500 });
  }
}
