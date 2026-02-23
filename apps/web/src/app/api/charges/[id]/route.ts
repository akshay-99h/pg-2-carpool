import { NextResponse } from 'next/server';
import { z } from 'zod';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

const schema = z.object({
  routeName: z.string().min(2),
  amount: z.number().int().min(10),
  notes: z.string().max(200).optional(),
  active: z.boolean().optional(),
  orderNo: z.number().int().min(0).optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  if (user.role !== 'ADMIN') {
    return forbidden('Admin only');
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const updated = await db.chargeItem.update({
      where: { id },
      data: parsed.data,
    });

    await logAudit({
      actorId: user.id,
      action: 'CHARGE_UPDATED',
      entity: 'charge_item',
      entityId: updated.id,
    });

    return NextResponse.json({ ok: true, charge: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update charge item' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  if (user.role !== 'ADMIN') {
    return forbidden('Admin only');
  }

  try {
    const { id } = await params;

    await db.chargeItem.delete({
      where: { id },
    });

    await logAudit({
      actorId: user.id,
      action: 'CHARGE_DELETED',
      entity: 'charge_item',
      entityId: id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete charge item' }, { status: 500 });
  }
}
