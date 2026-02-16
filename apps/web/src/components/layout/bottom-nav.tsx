'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { mobileMoreActivePrefixes, mobilePrimaryNavItems } from '@/components/layout/nav-items';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full border-t border-primary/15 bg-white/95 px-2 py-2 backdrop-blur md:hidden">
      <ul className="mx-auto grid w-full max-w-2xl grid-cols-4 gap-1">
        {mobilePrimaryNavItems.map((item) => {
          const active =
            item.href === '/dashboard/more'
              ? mobileMoreActivePrefixes.some(
                  (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
                )
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border border-transparent px-1 py-2 text-[10px] font-medium',
                  active
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:border-primary/10 hover:bg-accent'
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
  );
}
