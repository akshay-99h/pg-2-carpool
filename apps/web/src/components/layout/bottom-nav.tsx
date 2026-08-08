'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { mobileMoreActivePrefixes, mobilePrimaryNavItems } from '@/components/layout/nav-items';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="mx-auto w-[calc(100%-1.25rem)] max-w-md rounded-2xl border border-border/70 bg-white/95 p-1.5 shadow-[0_18px_34px_-24px_rgba(11,31,28,0.42)] backdrop-blur">
        <ul className="grid grid-cols-4 gap-1">
          {mobilePrimaryNavItems.map((item) => {
            const active =
              item.href === '/dashboard/more'
                ? mobileMoreActivePrefixes.some(
                    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
                  )
                : item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-xl border border-transparent px-1 py-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                    active
                      ? 'bg-primary text-primary-foreground shadow-[0_10px_18px_-14px_rgba(10,91,55,0.7)]'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {/* Labels are visible, not sr-only: four unlabelled glyphs is
                      the primary navigation for a mixed-age resident audience. */}
                  <span className="text-[0.66rem] font-medium leading-none">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
