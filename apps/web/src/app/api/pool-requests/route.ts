import { poolRequestSchema } from '@/lib/schemas';
import { TripType, type Weekday } from '@prisma/client';
import { NextResponse } from 'next/server';

import { logAudit } from '@/lib/audit';
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

  const poolRequests = await db.poolRequest.findMany({
    where: {
      status: 'OPEN',
    },
    orderBy: { createdAt: 'desc' },
    include: {
      repeatDays: {
        select: {
          day: true,
        },
      },
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  return NextResponse.json({
    poolRequests: poolRequests.map((request) => ({
      ...request,
      repeatDays: request.repeatDays.map((item) => item.day),
    })),
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
    const parsed = poolRequestSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const field =
        typeof firstIssue?.path?.[0] === 'string' ? (firstIssue.path[0] as string) : undefined;
      return NextResponse.json(
        {
          error: firstIssue?.message ?? 'Invalid pool request data',
          field,
        },
        { status: 400 }
      );
    }

    const repeatDays = parsed.data.tripType === TripType.DAILY ? parsed.data.repeatDays : [];

    const created = await db.poolRequest.create({
      data: {
        userId: user.id,
        tripType: parsed.data.tripType,
        fromLocation: parsed.data.from,
        toLocation: parsed.data.to,
        route: parsed.data.route,
        travelAt: new Date(parsed.data.travelAtIso),
        seatsNeeded: parsed.data.seatsNeeded,
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

    await logAudit({
      actorId: user.id,
      action: 'POOL_REQUEST_CREATED',
      entity: 'pool_request',
      entityId: created.id,
    });

    return NextResponse.json({
      ok: true,
      poolRequest: {
        ...created,
        repeatDays: created.repeatDays.map((item) => item.day),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to post request' }, { status: 500 });
  }
}
