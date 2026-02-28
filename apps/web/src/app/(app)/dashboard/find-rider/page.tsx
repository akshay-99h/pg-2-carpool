import { PoolRequestBoard } from '@/components/trips/pool-request-board';
import { Card, CardContent } from '@/components/ui/card';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function FindRiderPage() {
  await requireApprovedUser();

  return (
    <div className="space-y-3">
      <Card className="auth-hero-card">
        <CardContent className="pt-5">
          <p className="text-lg font-semibold">Find rider</p>
          <p className="text-sm text-muted-foreground">
            See rider demand posts and match them with your available trip seats.
          </p>
        </CardContent>
      </Card>
      <PoolRequestBoard />
    </div>
  );
}
