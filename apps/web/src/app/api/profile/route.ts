import { registerProfileSchema } from '@/lib/schemas';
import { NextResponse } from 'next/server';

import { logAudit } from '@/lib/audit';
import { getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  try {
    const body = await request.json();
    const parsed = registerProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const profile = await db.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        name: parsed.data.name,
        towerFlat: parsed.data.towerFlat,
        commuteRole: parsed.data.commuteRole,
        vehicleNumber: parsed.data.vehicleNumber || null,
        mobileNumber: parsed.data.mobileNumber,
      },
      update: {
        name: parsed.data.name,
        towerFlat: parsed.data.towerFlat,
        commuteRole: parsed.data.commuteRole,
        vehicleNumber: parsed.data.vehicleNumber || null,
        mobileNumber: parsed.data.mobileNumber,
      },
    });

    await logAudit({
      actorId: user.id,
      action: 'PROFILE_UPDATED',
      entity: 'profile',
      entityId: profile.id,
    });

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
