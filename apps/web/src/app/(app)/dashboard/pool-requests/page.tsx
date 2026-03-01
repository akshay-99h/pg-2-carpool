import { PoolRequestBoard } from '@/components/trips/pool-request-board';
import { Card, CardContent } from '@/components/ui/card';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function PoolRequestsPage() {
  const user = await requireApprovedUser();

  return (
    <div className="space-y-3">
      <Card className="auth-hero-card">
        <CardContent className="pt-5">
          <p className="text-lg font-semibold">Post pool request</p>
          <p className="text-sm text-muted-foreground">
            Post your ride need when no matching trip exists.
          </p>
        </CardContent>
      </Card>
      <PoolRequestBoard
        currentUserId={user.id}
        listTitle="Open pool requests"
        listDescription="Track active pool requests from residents and delete your own posts when plans change."
        emptyStateText="No open pool requests."
      />
    </div>
  );
}
