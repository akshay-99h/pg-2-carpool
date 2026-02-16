import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function SummaryPage() {
  await requireApprovedUser();

  return (
    <Card className="auth-hero-card">
      <CardHeader>
        <CardTitle>Project Summary</CardTitle>
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
          One-time rides auto-expire one hour after posting. Admins verify members before enabling
          ride features.
        </p>
      </CardContent>
    </Card>
  );
}
