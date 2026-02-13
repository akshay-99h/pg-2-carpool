import { userAdminUpdateSchema } from '@/lib/schemas';
import { NextResponse } from 'next/server';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function GET() {
  const admin = await getCurrentUser();
  if (!admin) {
    return unauthorized();
  }
  if (admin.role !== 'ADMIN') {
    return forbidden('Admin only');
  }

  const users = await db.user.findMany({
    include: {
      profile: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const admin = await getCurrentUser();
  if (!admin) {
    return unauthorized();
  }
  if (admin.role !== 'ADMIN') {
    return forbidden('Admin only');
  }

  try {
    const body = await request.json();
    const parsed = userAdminUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    if (admin.id === parsed.data.userId && parsed.data.role === 'USER') {
      return NextResponse.json({ error: 'Cannot remove your own admin role' }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: parsed.data.userId },
      data: {
        role: parsed.data.role,
        approvalStatus: parsed.data.approvalStatus,
      },
    });

    await logAudit({
      actorId: admin.id,
      action: 'USER_UPDATED_BY_ADMIN',
      entity: 'user',
      entityId: updated.id,
      metadata: {
        role: parsed.data.role,
        approvalStatus: parsed.data.approvalStatus,
      },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
