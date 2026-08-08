import { Megaphone } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { LogoutButton } from '@/components/forms/logout-button';
import { AppLogo } from '@/components/layout/app-logo';
import { BottomNav } from '@/components/layout/bottom-nav';
import { DesktopNavRail } from '@/components/layout/desktop-nav-rail';
import { MobileShell } from '@/components/layout/mobile-shell';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import { requireProfileCompletion } from '@/server/auth-guards';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireProfileCompletion();
  const userName = user.profile?.name ?? user.email ?? 'Resident';
  const towerFlat = user.profile?.towerFlat ?? null;
  const approvalStatus = user.approvalStatus ?? 'PENDING';
  const appNotice = await db.appNotice
    .findUnique({
      where: { id: 'app-notice' },
    })
    .catch(() => null);
  const activeNotice = appNotice?.active ? appNotice : null;

  return (
    <MobileShell>
      {/* Slim, non-sticky header. Logout moved to the More tab: it was the most
          prominent control on every screen and is one of the least used. */}
      <header className="flex items-center justify-between gap-2 md:hidden">
        <AppLogo compact className="shrink-0" />
        {approvalStatus !== 'APPROVED' ? (
          <Link
            href="/approval-pending"
            className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-amber-900"
          >
            Pending
          </Link>
        ) : null}
      </header>

      {activeNotice ? (
        <section className="surface-raised rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Megaphone className="h-4 w-4" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{activeNotice.title}</p>
              <p className="text-sm text-muted-foreground">{activeNotice.content}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-[280px_1fr] md:items-start">
        <DesktopNavRail userName={userName} towerFlat={towerFlat} approvalStatus={approvalStatus} />
        {/* min-w-0 is load-bearing: grid items default to `min-width: auto`, so
            without it this track cannot shrink below its content's min-content
            width and long trip destinations push the whole page sideways. */}
        <div className="min-w-0 space-y-4 md:space-y-5">
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
