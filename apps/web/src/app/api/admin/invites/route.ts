import { NextResponse } from 'next/server';
import { z } from 'zod';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

const schema = z.object({
  email: z.string().email(),
});

export async function GET() {
  const admin = await getCurrentUser();
  if (!admin) {
    return unauthorized();
  }
  if (admin.role !== 'ADMIN') {
    return forbidden('Admin only');
  }

  const invites = await db.adminInvite.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        include: {
          profile: true,
        },
      },
    },
  });

  return NextResponse.json({ invites });
}

export async function POST(request: Request) {
  const admin = await getCurrentUser();
  if (!admin) {
    return unauthorized();
  }
  if (admin.role !== 'ADMIN') {
    return forbidden('Admin only');
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();

    const invite = await db.adminInvite.upsert({
      where: { email },
      create: {
        email,
        createdById: admin.id,
      },
      update: {
        createdById: admin.id,
      },
    });

    await db.user.updateMany({
      where: { email },
      data: {
        role: 'ADMIN',
        approvalStatus: 'APPROVED',
      },
    });

    await logAudit({
      actorId: admin.id,
      action: 'ADMIN_INVITE_CREATED',
      entity: 'admin_invite',
      entityId: invite.id,
      metadata: { email: invite.email },
    });

    return NextResponse.json({ ok: true, invite });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save invite' }, { status: 500 });
  }
}
