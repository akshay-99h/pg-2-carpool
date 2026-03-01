import { PoolRequestBoard } from '@/components/trips/pool-request-board';
import { Card, CardContent } from '@/components/ui/card';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function FindPassengerPage() {
  const user = await requireApprovedUser();

  return (
    <div className="space-y-3">
      <Card className="auth-hero-card">
        <CardContent className="pt-5">
          <p className="text-lg font-semibold">Find passenger</p>
          <p className="text-sm text-muted-foreground">
            Browse posted pool requests and match them with available seats on your trip.
          </p>
        </CardContent>
      </Card>
      <PoolRequestBoard
        currentUserId={user.id}
        showComposer={false}
        listTitle="Open passenger requests"
        listDescription="Passenger demand posts from residents looking for a matching trip."
        emptyStateText="No passenger requests are open right now."
      />
    </div>
  );
}
