import { NextResponse } from 'next/server';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { appNoticeSchema } from '@/lib/schemas';

const APP_NOTICE_ID = 'app-notice';

export async function GET() {
  const notice = await db.appNotice
    .findUnique({
      where: { id: APP_NOTICE_ID },
    })
    .catch(() => null);

  return NextResponse.json({ notice });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  if (user.role !== 'ADMIN') {
    return forbidden('Admin only');
  }

  try {
    const body = await request.json();
    const parsed = appNoticeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const notice = await db.appNotice.upsert({
      where: { id: APP_NOTICE_ID },
      update: {
        title: parsed.data.title,
        content: parsed.data.content,
        active: parsed.data.active,
      },
      create: {
        id: APP_NOTICE_ID,
        title: parsed.data.title,
        content: parsed.data.content,
        active: parsed.data.active,
      },
    });

    await logAudit({
      actorId: user.id,
      action: 'APP_NOTICE_UPDATED',
      entity: 'app_notice',
      entityId: notice.id,
      metadata: { active: notice.active },
    });

    return NextResponse.json({ ok: true, notice });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update app notice' }, { status: 500 });
  }
}
