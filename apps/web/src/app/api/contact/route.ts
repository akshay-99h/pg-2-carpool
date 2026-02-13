import { contactSchema } from '@/lib/schemas';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  if (user.role !== 'ADMIN') {
    return forbidden('Admin only');
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const queries = await db.contactQuery.findMany({
    where: status
      ? {
          status: status as 'OPEN' | 'IN_PROGRESS' | 'CLOSED',
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  return NextResponse.json({ queries });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const query = await db.contactQuery.create({
      data: {
        userId: user?.id,
        name: parsed.data.name,
        mobile: parsed.data.mobile,
        message: parsed.data.message,
      },
    });

    await logAudit({
      actorId: user?.id,
      action: 'CONTACT_SUBMITTED',
      entity: 'contact_query',
      entityId: query.id,
    });

    return NextResponse.json({ ok: true, query });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to submit query' }, { status: 500 });
  }
}

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  if (user.role !== 'ADMIN') {
    return forbidden('Admin only');
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const query = await db.contactQuery.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
    });

    await logAudit({
      actorId: user.id,
      action: 'CONTACT_STATUS_UPDATED',
      entity: 'contact_query',
      entityId: query.id,
      metadata: { status: query.status },
    });

    return NextResponse.json({ ok: true, query });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update query' }, { status: 500 });
  }
}
