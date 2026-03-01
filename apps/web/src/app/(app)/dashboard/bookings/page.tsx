import { BookingManager } from '@/components/trips/booking-manager';
import { Card, CardContent } from '@/components/ui/card';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function BookingsPage() {
  await requireApprovedUser();

  return (
    <div className="space-y-3">
      <Card className="auth-hero-card">
        <CardContent className="pt-5">
          <p className="text-lg font-semibold">My bookings</p>
          <p className="text-sm text-muted-foreground">
            Manage requests on your trips and track the seat requests you sent.
          </p>
        </CardContent>
      </Card>
      <BookingManager />
    </div>
  );
}
