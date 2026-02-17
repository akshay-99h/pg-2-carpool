import { contactSchema } from '@/lib/schemas';
import type { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

import { logAudit } from '@/lib/audit';
import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { env } from '@/lib/env';

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;
const isProduction = process.env.NODE_ENV === 'production';
const CONTACT_PAGE_SIZE_DEFAULT = 25;
const CONTACT_PAGE_SIZE_MAX = 100;
const CONTACT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const CONTACT_RATE_LIMIT_IP_MAX = 6;
const CONTACT_RATE_LIMIT_MOBILE_MAX = 4;
const ipAttemptStore = new Map<string, number[]>();

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for') ?? '';
  const realIp = request.headers.get('x-real-ip') ?? '';
  const candidate = forwarded.split(',')[0]?.trim() || realIp.trim();
  return candidate || 'unknown';
}

function isIpRateLimited(ip: string) {
  const now = Date.now();
  const attempts = ipAttemptStore.get(ip) ?? [];
  const recentAttempts = attempts.filter(
    (timestamp) => now - timestamp < CONTACT_RATE_LIMIT_WINDOW_MS
  );
  recentAttempts.push(now);
  ipAttemptStore.set(ip, recentAttempts);
  return recentAttempts.length > CONTACT_RATE_LIMIT_IP_MAX;
}

function hasSuspiciousMessage(message: string) {
  const linkMatches = message.match(/https?:\/\//gi) ?? [];
  const repeatedChars = /(.)\1{6,}/.test(message);
  return linkMatches.length > 2 || repeatedChars;
}

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
  const q = searchParams.get('q')?.trim() || '';
  const page = parsePositiveInteger(searchParams.get('page'), 1);
  const pageSize = Math.min(
    parsePositiveInteger(searchParams.get('pageSize'), CONTACT_PAGE_SIZE_DEFAULT),
    CONTACT_PAGE_SIZE_MAX
  );
  const skip = (page - 1) * pageSize;

  const statusFilter: Prisma.ContactQueryWhereInput | undefined = status
    ? { status: status as 'OPEN' | 'IN_PROGRESS' | 'CLOSED' }
    : undefined;
  const searchFilter = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { mobile: { contains: q, mode: 'insensitive' as const } },
          { message: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : undefined;

  const andFilters: Prisma.ContactQueryWhereInput[] = [];
  if (statusFilter) {
    andFilters.push(statusFilter);
  }
  if (searchFilter) {
    andFilters.push(searchFilter);
  }

  const where: Prisma.ContactQueryWhereInput | undefined =
    andFilters.length > 0
      ? {
          AND: andFilters,
        }
      : undefined;

  const [queries, total] = await Promise.all([
    db.contactQuery.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      skip,
      take: pageSize,
    }),
    db.contactQuery.count({ where }),
  ]);

  return NextResponse.json({
    queries,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    if (parsed.data.website) {
      // Honeypot field for bot submissions.
      return NextResponse.json({ ok: true });
    }

    if (parsed.data.captcha.toUpperCase() !== env.contactCaptchaPhrase.toUpperCase()) {
      return NextResponse.json({ error: 'Captcha verification failed' }, { status: 400 });
    }

    if (hasSuspiciousMessage(parsed.data.message)) {
      return NextResponse.json(
        { error: 'Message looks suspicious. Please edit and retry.' },
        { status: 400 }
      );
    }

    const clientIp = getClientIp(request);
    if (isIpRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes before retrying.' },
        { status: 429 }
      );
    }

    const recentMobileCount = await db.contactQuery.count({
      where: {
        mobile: parsed.data.mobile,
        createdAt: {
          gt: new Date(Date.now() - CONTACT_RATE_LIMIT_WINDOW_MS),
        },
      },
    });

    if (recentMobileCount >= CONTACT_RATE_LIMIT_MOBILE_MAX) {
      return NextResponse.json(
        { error: 'Too many requests from this mobile number. Please wait and retry.' },
        { status: 429 }
      );
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
