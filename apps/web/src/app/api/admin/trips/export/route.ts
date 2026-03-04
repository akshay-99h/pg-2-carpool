import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

import { forbidden, getCurrentUser, unauthorized } from '@/lib/auth/session';
import { db } from '@/lib/db';

const repeatDayLabel: Record<string, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  if (user.role !== 'ADMIN') {
    return forbidden('Admin access required');
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() ?? '';

  const where = query
    ? {
        OR: [
          { fromLocation: { contains: query, mode: 'insensitive' as const } },
          { route: { contains: query, mode: 'insensitive' as const } },
          { toLocation: { contains: query, mode: 'insensitive' as const } },
        ],
      }
    : undefined;

  const trips = await db.trip.findMany({
    where,
    include: {
      driver: {
        include: {
          profile: true,
        },
      },
      repeatDays: {
        select: {
          day: true,
        },
      },
      requests: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: [{ departAt: 'desc' }, { createdAt: 'desc' }],
  });

  const rows = trips.map((trip) => {
    let pendingRequests = 0;
    let confirmedRequests = 0;
    let rejectedRequests = 0;

    for (const request of trip.requests) {
      if (request.status === 'CONFIRMED') {
        confirmedRequests += 1;
      } else if (request.status === 'REJECTED') {
        rejectedRequests += 1;
      } else {
        pendingRequests += 1;
      }
    }

    return {
      'Trip ID': trip.id,
      Status: trip.status,
      'Trip Type': trip.tripType,
      From: trip.fromLocation,
      To: trip.toLocation,
      Route: trip.route,
      'Departure ISO': trip.departAt.toISOString(),
      'Repeat Days': trip.repeatDays.map((item) => repeatDayLabel[item.day] ?? item.day).join(', '),
      'Seats Available': trip.seatsAvailable,
      'Seats Booked': trip.seatsBooked,
      'Request Count': trip.requests.length,
      'Pending Requests': pendingRequests,
      'Confirmed Requests': confirmedRequests,
      'Rejected Requests': rejectedRequests,
      'Driver Name': trip.driver.profile?.name ?? '',
      'Driver Email': trip.driver.email ?? '',
      'Driver Flat': trip.driver.profile?.towerFlat ?? '',
      Notes: trip.notes ?? '',
      'Created At ISO': trip.createdAt.toISOString(),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Trips');
  const xlsxBuffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
  });
  const fileStamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(xlsxBuffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="trips-export-${fileStamp}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
