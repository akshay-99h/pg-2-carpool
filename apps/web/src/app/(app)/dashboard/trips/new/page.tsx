import { TripCreateForm } from '@/components/trips/trip-create-form';
import { Card, CardContent } from '@/components/ui/card';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function NewTripPage() {
  await requireApprovedUser();

  return (
    <div className="space-y-3">
      <Card className="auth-hero-card">
        <CardContent className="pt-5">
          <p className="text-lg font-semibold">Post a trip</p>
          <p className="text-sm text-muted-foreground">
            Daily rides include repeat days. One-time rides are posted for a single trip.
          </p>
        </CardContent>
      </Card>
      <TripCreateForm />
    </div>
  );
}
