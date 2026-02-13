import { NextResponse } from 'next/server';
import { z } from 'zod';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

const schema = z.object({
  title: z.string().min(3),
  content: z.string().min(30),
  version: z.string().min(1).max(12),
});

export async function GET() {
  const terms = await db.termsDocument.findFirst({
    where: { active: true },
    orderBy: { publishedAt: 'desc' },
  });

  return NextResponse.json({ terms });
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
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    await db.termsDocument.updateMany({ data: { active: false } });

    const terms = await db.termsDocument.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        version: parsed.data.version,
        active: true,
      },
    });

    await logAudit({
      actorId: user.id,
      action: 'TERMS_UPDATED',
      entity: 'terms_document',
      entityId: terms.id,
      metadata: { version: terms.version },
    });

    return NextResponse.json({ ok: true, terms });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update terms' }, { status: 500 });
  }
}
