import Link from 'next/link';
import type { ReactNode } from 'react';

import { LogoutButton } from '@/components/forms/logout-button';
import { AppLogo } from '@/components/layout/app-logo';
import { BottomNav } from '@/components/layout/bottom-nav';
import { DesktopNavRail } from '@/components/layout/desktop-nav-rail';
import { MobileShell } from '@/components/layout/mobile-shell';
import { Badge } from '@/components/ui/badge';
import { requireProfileCompletion } from '@/server/auth-guards';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireProfileCompletion();
  const userName = user.profile?.name ?? user.email ?? 'Resident';
  const towerFlat = user.profile?.towerFlat ?? null;
  const approvalStatus = user.approvalStatus ?? 'PENDING';

  return (
    <MobileShell>
      <header className="surface-raised sticky top-2 z-40 rounded-2xl px-3 py-2.5 md:hidden">
        <div className="flex items-center justify-between gap-2 md:gap-3">
          <AppLogo compact className="shrink-0" />

          <div className="flex items-center gap-1.5 md:gap-2">
            {approvalStatus !== 'APPROVED' ? (
              <Link
                href="/approval-pending"
                className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-amber-900"
              >
                Pending
              </Link>
            ) : null}
            <div className="shrink-0">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-[280px_1fr] md:items-start">
        <DesktopNavRail userName={userName} towerFlat={towerFlat} approvalStatus={approvalStatus} />
        <div className="space-y-4 md:space-y-5">
          <div className="surface-raised hidden items-center justify-between gap-3 rounded-2xl px-4 py-3 md:flex">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">Tower/Flat: {towerFlat ?? 'Not set'}</p>
            </div>
            <div className="flex items-center gap-2">
              {approvalStatus !== 'APPROVED' ? <Badge variant="warning">Pending</Badge> : null}
              <LogoutButton />
            </div>
          </div>
          {children}
        </div>
      </section>

      <BottomNav />
    </MobileShell>
  );
}
