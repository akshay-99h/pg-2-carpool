import { contactSchema } from '@/lib/schemas';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { env } from '@/lib/env';

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;
const isProduction = process.env.NODE_ENV === 'production';

async function notifyAdminsOfContactQuery({
  name,
  mobile,
  message,
  createdAt,
}: {
  name: string;
  mobile: string;
  message: string;
  createdAt: Date;
}) {
  const adminUsers = await db.user.findMany({
    where: {
      role: 'ADMIN',
      isActive: true,
      email: {
        not: null,
      },
    },
    select: {
      email: true,
    },
  });

  const recipients = Array.from(
    new Set([
      ...adminUsers.map((admin) => admin.email?.trim().toLowerCase() ?? ''),
      ...env.bootstrapAdminEmails,
    ])
  ).filter(Boolean);

  if (recipients.length === 0) {
    return;
  }

  const adminContactUrl = `${env.appUrl.replace(/\/$/, '')}/admin/contacts`;
  const textBody = [
    'New Contact Us query submitted',
    '',
    `Name: ${name}`,
    `Mobile: ${mobile}`,
    `Submitted At: ${createdAt.toISOString()}`,
    '',
    'Message:',
    message,
    '',
    `Open in admin portal: ${adminContactUrl}`,
  ].join('\n');

  if (!resend) {
    if (!isProduction) {
      console.info('Contact query admin email fallback', { recipients, textBody });
    }
    return;
  }

  await resend.emails.send({
    from: env.emailFrom,
    to: recipients,
    subject: `New Contact Query: ${name} (${mobile})`,
    text: textBody,
  });
}

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

    try {
      await notifyAdminsOfContactQuery({
        name: query.name,
        mobile: query.mobile,
        message: query.message,
        createdAt: query.createdAt,
      });
    } catch (notifyError) {
      console.error('Contact query email notification failed', notifyError);
    }

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
