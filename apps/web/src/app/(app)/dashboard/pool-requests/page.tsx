import { PoolRequestBoard } from '@/components/trips/pool-request-board';
import { Card, CardContent } from '@/components/ui/card';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function PoolRequestsPage() {
  await requireApprovedUser();

  return (
    <div className="space-y-3">
      <Card className="auth-hero-card">
        <CardContent className="pt-5">
          <p className="text-lg font-semibold">Pool requests</p>
          <p className="text-sm text-muted-foreground">
            Post your ride need when no matching trip exists.
          </p>
        </CardContent>
      </Card>
      <PoolRequestBoard />
    </div>
  );
}
