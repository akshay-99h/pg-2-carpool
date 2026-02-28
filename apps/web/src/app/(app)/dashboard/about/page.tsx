import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function AboutPage() {
  await requireApprovedUser();

  return (
    <Card className="auth-hero-card">
      <CardHeader>
        <CardTitle>About Car Pool PG2</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Car Pool Panchsheel Greens 2 helps residents share rides for office, school, and one-off
          travel. The goal is lower commute cost, better safety, and lower traffic footprint.
        </p>
        <p>
          Use the app to post daily or one-time trips, request seats, coordinate pickup timings, and
          follow approved route-wise charge guidance.
        </p>
        <p>
          Residents can also post rider demand requests when no matching trip is available so
          vehicle owners can respond quickly.
        </p>
      </CardContent>
    </Card>
  );
}
