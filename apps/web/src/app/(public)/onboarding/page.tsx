import { BadgeCheck, House, UserRound } from 'lucide-react';
import { redirect } from 'next/navigation';

import { OnboardingForm } from '@/components/forms/onboarding-form';
import { AppLogo } from '@/components/layout/app-logo';
import { MobileShell } from '@/components/layout/mobile-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/lib/db';

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.profile && user.approvalStatus === 'APPROVED') {
    redirect('/dashboard');
  }

  const admins = await db.user.findMany({
    where: {
      role: 'ADMIN',
      isActive: true,
      profile: {
        is: {
          mobileNumber: {
            not: '',
          },
        },
      },
    },
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          name: true,
          towerFlat: true,
          mobileNumber: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 6,
  });

  const adminWhatsappOptions = admins
    .map((admin) => {
      const mobile = admin.profile?.mobileNumber ?? '';
      const digits = mobile.replace(/\D/g, '');
      if (digits.length < 10) {
        return null;
      }
      const label = admin.profile?.name
        ? `${admin.profile.name} (${mobile})`
        : `${admin.email ?? 'Admin'} (${mobile})`;

      return {
        id: admin.id,
        label,
        mobileNumber: mobile,
      };
    })
    .filter((item): item is { id: string; label: string; mobileNumber: string } => Boolean(item));

  return (
    <MobileShell withBottomInset={false} className="auth-aesthetic pt-6">
      <section className="grid gap-4 md:grid-cols-[1fr_1.1fr] md:items-start">
        <Card className="auth-hero-card hidden md:block">
          <CardHeader>
            <CardTitle className="text-2xl">Complete resident registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              We need your society and commute details so ride matching remains secure and relevant.
            </p>
            <div className="auth-tile space-y-2 p-3">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-primary" />
                <p>Real resident identity</p>
              </div>
              <div className="flex items-center gap-2">
                <House className="h-4 w-4 text-primary" />
                <p>Tower/Flat verification</p>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-primary" />
                <p>Admin approval unlocks trips</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="app-surface rounded-2xl p-4">
            <AppLogo compact />
          </div>
          <OnboardingForm
            submitLabel="Register yourself"
            showLoginAction
            initial={
              user.profile
                ? {
                    name: user.profile.name,
                    towerFlat: user.profile.towerFlat,
                    commuteRole: user.profile.commuteRole,
                    vehicleNumber: user.profile.vehicleNumber,
                    mobileNumber: user.profile.mobileNumber,
                  }
                : undefined
            }
            adminWhatsappOptions={adminWhatsappOptions}
          />
        </div>
      </section>
    </MobileShell>
  );
}
