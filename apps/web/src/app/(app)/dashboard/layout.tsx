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

  return (
    <MobileShell className="auth-aesthetic">
      <header className="app-surface rounded-2xl p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <AppLogo compact />
          <div className="space-y-2 text-right md:flex md:items-center md:gap-2 md:space-y-0">
            <Badge
              variant={user.role === 'ADMIN' ? 'secondary' : 'default'}
              className="status-pill justify-center px-2.5 py-1"
            >
              {user.role}
            </Badge>
            <div className="hidden md:block">
              <LogoutButton />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4 text-sm">
          <div>
            <p className="font-medium text-foreground">{user.profile?.name ?? user.email}</p>
            <p className="text-xs text-muted-foreground">
              Tower/Flat: {user.profile?.towerFlat ?? 'Not set'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user.approvalStatus !== 'APPROVED' ? (
              <Link
                href="/approval-pending"
                className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900"
              >
                Approval Awaited
              </Link>
            ) : null}
            {user.role === 'ADMIN' ? (
              <Link
                href="/admin"
                className="rounded-full border border-secondary/20 bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary"
              >
                Open Admin Portal
              </Link>
            ) : null}
            <div className="md:hidden">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-[225px_1fr] md:items-start">
        <DesktopNavRail />
        <div className="space-y-4 md:space-y-5">{children}</div>
      </section>

      <BottomNav />
    </MobileShell>
  );
}
