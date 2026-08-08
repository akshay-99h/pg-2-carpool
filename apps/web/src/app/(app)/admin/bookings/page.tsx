import { BookingRevokeManager } from '@/components/admin/booking-revoke-manager';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Booking Controls',
};

export default function AdminBookingsPage() {
  return <BookingRevokeManager />;
}
