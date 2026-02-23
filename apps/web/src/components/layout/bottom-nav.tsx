'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { mobileMoreActivePrefixes, mobilePrimaryNavItems } from '@/components/layout/nav-items';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-3 z-50 md:hidden">
      <div className="mx-auto w-[calc(100%-1.25rem)] max-w-md rounded-2xl border border-border/70 bg-white/90 p-1.5 shadow-[0_18px_34px_-24px_rgba(11,31,28,0.42)] backdrop-blur">
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
                  className={cn(
                    'relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full border border-transparent px-1 py-1.5 text-[0.65rem] font-medium transition',
                    active
                      ? 'bg-primary text-primary-foreground shadow-[0_10px_18px_-14px_rgba(10,91,55,0.7)]'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden leading-none min-[390px]:block">{item.label}</span>
                  {active ? <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-white" /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
