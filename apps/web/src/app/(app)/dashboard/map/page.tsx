import { RouteMap } from '@/components/trips/route-map';
import { Card, CardContent } from '@/components/ui/card';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function MapPage() {
  await requireApprovedUser();

  return (
    <div className="space-y-3">
      <Card className="auth-hero-card">
        <CardContent className="pt-5">
          <p className="text-lg font-semibold">Route map</p>
          <p className="text-sm text-muted-foreground">
            Check path and commute mode before posting or booking a trip.
          </p>
        </CardContent>
      </Card>
      <RouteMap />
    </div>
  );
}
