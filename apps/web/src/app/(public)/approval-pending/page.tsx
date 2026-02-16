import { Clock4 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AppLogo } from '@/components/layout/app-logo';
import { MobileShell } from '@/components/layout/mobile-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth/session';

export default async function ApprovalPendingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!user.profile) {
    redirect('/onboarding');
  }

  if (user.approvalStatus === 'APPROVED') {
    redirect('/dashboard');
  }

  return (
    <MobileShell withBottomInset={false} className="auth-aesthetic pt-6">
      <div className="app-surface rounded-2xl p-4">
        <AppLogo compact />
      </div>
      <Card className="auth-hero-card">
        <CardHeader>
          <Badge variant="warning" className="status-pill w-fit px-2.5 py-1">
            {user.approvalStatus}
          </Badge>
          <CardTitle className="text-xl">Profile under admin review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="auth-tile flex items-center gap-2 p-3 text-amber-900">
            <Clock4 className="h-4 w-4" />
            <p className="font-medium">Ride posting is paused until approval is complete.</p>
          </div>
          <p>
            Your account is created but ride posting/booking is disabled until society admin
            verifies your registration details.
          </p>
          <p>
            If this takes too long, contact admin through the contact page after approval or request
            support in your core society group.
          </p>
          <Button asChild className="w-full">
            <Link href="/onboarding">Update profile details</Link>
          </Button>
        </CardContent>
      </Card>
    </MobileShell>
  );
}
