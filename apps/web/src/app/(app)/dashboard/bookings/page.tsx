import { BookingManager } from '@/components/trips/booking-manager';
import { Card, CardContent } from '@/components/ui/card';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function BookingsPage() {
  await requireApprovedUser();

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="pt-5">
          <p className="text-lg font-semibold">Booking confirmations</p>
          <p className="text-sm text-muted-foreground">
            Manage incoming requests and track your own seat bookings.
          </p>
        </CardContent>
      </Card>
      <BookingManager />
    </div>
  );
}
