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

export async function GET() {
  const charges = await db.chargeItem.findMany({
    where: { active: true },
    orderBy: [{ orderNo: 'asc' }, { routeName: 'asc' }],
  });

  return NextResponse.json({ charges });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  if (user.role !== 'ADMIN') {
    return forbidden('Admin only');
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const created = await db.chargeItem.create({
      data: parsed.data,
    });

    await logAudit({
      actorId: user.id,
      action: 'CHARGE_CREATED',
      entity: 'charge_item',
      entityId: created.id,
    });

    return NextResponse.json({ ok: true, charge: created });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create charge item' }, { status: 500 });
  }
}
