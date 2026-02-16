import { userAdminUpdateSchema } from '@/lib/schemas';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

const deleteSchema = z.object({
  userId: z.string().uuid(),
});

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

export async function DELETE(request: Request) {
  const admin = await getCurrentUser();
  if (!admin) {
    return unauthorized();
  }
  if (admin.role !== 'ADMIN') {
    return forbidden('Admin only');
  }

  try {
    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    if (admin.id === parsed.data.userId) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    const target = await db.user.findUnique({
      where: { id: parsed.data.userId },
      select: { id: true, role: true, email: true },
    });

    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (target.role === 'ADMIN') {
      const adminCount = await db.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last remaining admin account' },
          { status: 400 }
        );
      }
    }

    await db.user.delete({ where: { id: parsed.data.userId } });

    await logAudit({
      actorId: admin.id,
      action: 'USER_DELETED_BY_ADMIN',
      entity: 'user',
      entityId: target.id,
      metadata: { email: target.email, role: target.role },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
