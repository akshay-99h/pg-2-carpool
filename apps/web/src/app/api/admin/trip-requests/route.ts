import { NextResponse } from 'next/server';

import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

const REQUEST_PAGE_SIZE_DEFAULT = 25;
const REQUEST_PAGE_SIZE_MAX = 100;

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

export async function GET(request: Request) {
  const admin = await getCurrentUser();
  if (!admin) {
    return unauthorized();
  }
  if (admin.role !== 'ADMIN') {
    return forbidden('Admin only');
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const page = parsePositiveInteger(searchParams.get('page'), 1);
  const pageSize = Math.min(
    parsePositiveInteger(searchParams.get('pageSize'), REQUEST_PAGE_SIZE_DEFAULT),
    REQUEST_PAGE_SIZE_MAX
  );
  const skip = (page - 1) * pageSize;

  const where = q
    ? {
        OR: [
          { rider: { email: { contains: q, mode: 'insensitive' as const } } },
          { rider: { profile: { is: { name: { contains: q, mode: 'insensitive' as const } } } } },
          {
            rider: { profile: { is: { towerFlat: { contains: q, mode: 'insensitive' as const } } } },
          },
          { trip: { driver: { email: { contains: q, mode: 'insensitive' as const } } } },
          {
            trip: { driver: { profile: { is: { name: { contains: q, mode: 'insensitive' as const } } } } },
          },
          {
            trip: {
              driver: { profile: { is: { towerFlat: { contains: q, mode: 'insensitive' as const } } } },
            },
          },
          { trip: { fromLocation: { contains: q, mode: 'insensitive' as const } } },
          { trip: { toLocation: { contains: q, mode: 'insensitive' as const } } },
        ],
      }
    : undefined;

  const [requests, total] = await Promise.all([
    db.tripRequest.findMany({
      where,
      include: {
        rider: {
          include: {
            profile: true,
          },
        },
        trip: {
          include: {
            driver: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    db.tripRequest.count({ where }),
  ]);

  return NextResponse.json({
    requests,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}
