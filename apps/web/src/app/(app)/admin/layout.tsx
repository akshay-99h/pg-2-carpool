import Link from 'next/link';
import type { ReactNode } from 'react';

import { LogoutButton } from '@/components/forms/logout-button';
import { AdminNav } from '@/components/layout/admin-nav';
import { AppLogo } from '@/components/layout/app-logo';
import { MobileShell } from '@/components/layout/mobile-shell';
import { requireAdminUser } from '@/server/auth-guards';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdminUser();

  return (
    <MobileShell withBottomInset={false} className="auth-aesthetic">
      <header className="app-surface space-y-3 rounded-2xl p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <AppLogo compact />
          <div className="hidden md:block">
            <LogoutButton />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3 text-sm">
          <p className="font-medium text-foreground">{user.profile?.name ?? user.email}</p>
          <Link
            href="/dashboard"
            className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
          >
            Back to App
          </Link>
          <div className="md:hidden">
            <LogoutButton />
          </div>
        </div>

        <AdminNav />
      </header>
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </MobileShell>
  );
}
