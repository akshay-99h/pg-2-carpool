import { BookingManager } from '@/components/trips/booking-manager';
import { requireApprovedUser } from '@/server/auth-guards';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Bookings',
};

export default async function BookingsPage() {
  await requireApprovedUser();

  return (
    <div className="space-y-3">
      <h1 className="font-heading text-xl font-semibold tracking-tight">My bookings</h1>
      <BookingManager />
    </div>
  );
}
