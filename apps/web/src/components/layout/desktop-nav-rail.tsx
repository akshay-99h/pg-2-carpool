'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { userNavItems } from '@/components/layout/nav-items';
import { cn } from '@/lib/utils';

export function DesktopNavRail() {
  const pathname = usePathname();

  return (
    <aside className="app-surface sticky top-6 hidden h-fit rounded-2xl p-3 md:block">
      <p className="mb-2 px-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Navigate
      </p>
      <ul className="space-y-1.5">
        {userNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium transition',
                  active
                    ? 'border-primary/25 bg-primary/10 text-primary'
                    : 'text-foreground/80 hover:border-primary/15 hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
