import { ApprovalStatus, Prisma, UserRole } from '@prisma/client';

import { db } from '@/lib/db';
import { env } from '@/lib/env';

function shouldBootstrapAdmin(email: string) {
  return env.bootstrapAdminEmails.includes(email.toLowerCase());
}

export async function getOrCreateUserFromEmail(email: string) {
  const normalizedEmail = email.toLowerCase();

  const existing = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return existing;
  }

  const invite = await db.adminInvite.findUnique({
    where: { email: normalizedEmail },
  });

  try {
    return await db.user.create({
      data: {
        email: normalizedEmail,
        role: invite || shouldBootstrapAdmin(normalizedEmail) ? UserRole.ADMIN : UserRole.USER,
        approvalStatus:
          invite || shouldBootstrapAdmin(normalizedEmail)
            ? ApprovalStatus.APPROVED
            : ApprovalStatus.PENDING,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const recovered = await db.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (recovered) {
        return recovered;
      }
    }
    throw error;
  }
}

export async function getOrCreateUserFromGoogle({
  email,
  sub,
}: {
  email: string;
  sub: string;
}) {
  const normalizedEmail = email.toLowerCase();

  const existing = await db.user.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { googleSub: sub }],
    },
  });

  if (existing) {
    return db.user.update({
      where: { id: existing.id },
      data: {
        email: normalizedEmail,
        googleSub: sub,
      },
    });
  }

  const invite = await db.adminInvite.findUnique({
    where: { email: normalizedEmail },
  });

  try {
    return await db.user.create({
      data: {
        email: normalizedEmail,
        googleSub: sub,
        role: invite || shouldBootstrapAdmin(normalizedEmail) ? UserRole.ADMIN : UserRole.USER,
        approvalStatus:
          invite || shouldBootstrapAdmin(normalizedEmail)
            ? ApprovalStatus.APPROVED
            : ApprovalStatus.PENDING,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const recovered = await db.user.findFirst({
        where: {
          OR: [{ email: normalizedEmail }, { googleSub: sub }],
        },
      });

      if (recovered) {
        return db.user.update({
          where: { id: recovered.id },
          data: {
            email: normalizedEmail,
            googleSub: sub,
          },
        });
      }
    }
    throw error;
  }
}
