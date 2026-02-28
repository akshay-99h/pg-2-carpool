'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LogoutButton } from '@/components/forms/logout-button';
import { AppLogo } from '@/components/layout/app-logo';
import { userNavItems } from '@/components/layout/nav-items';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type DesktopNavRailProps = {
  userName: string;
  towerFlat?: string | null;
  approvalStatus: string;
};

export function DesktopNavRail({ userName, towerFlat, approvalStatus }: DesktopNavRailProps) {
  const pathname = usePathname();

  return (
    <aside className="surface-raised sticky top-5 hidden h-[calc(100dvh-2.5rem)] max-h-[860px] min-h-[620px] w-full flex-col rounded-2xl p-3 md:flex">
      <div className="space-y-3 border-b border-border/70 pb-3">
        <AppLogo compact />
        <div className="surface-inset rounded-xl p-3">
          <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            Tower/Flat: {towerFlat ?? 'Not set'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {approvalStatus !== 'APPROVED' ? (
              <Badge variant="warning" size="sm">
                Pending Approval
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <nav className="mt-3 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {userNavItems.map((item) => {
            const active =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'nav-item focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    active ? 'nav-item-active' : ''
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-3 space-y-2 border-t border-border/70 pt-3">
        <Link
          href="/dashboard/profile"
          className="inline-flex w-full items-center justify-center rounded-full border border-border bg-white px-3 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
        >
          Profile Settings
        </Link>
        <LogoutButton className="w-full justify-center" />
      </div>
    </aside>
  );
}
