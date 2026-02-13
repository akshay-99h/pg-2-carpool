import type { Prisma } from '@prisma/client';

import { db } from '@/lib/db';

export async function logAudit({
  actorId,
  action,
  entity,
  entityId,
  metadata,
}: {
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  await db.auditLog.create({
    data: {
      actorId,
      action,
      entity,
      entityId,
      metadata: metadata as Prisma.InputJsonValue | undefined,
    },
  });
}
