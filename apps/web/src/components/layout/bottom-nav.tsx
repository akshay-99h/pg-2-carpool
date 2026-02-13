'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { userNavItems } from '@/components/layout/nav-items';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full border-t border-border/80 bg-white/95 px-2 py-2 backdrop-blur md:hidden">
      <ul className="mx-auto flex w-full max-w-2xl gap-1 overflow-x-auto">
        {userNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href} className="min-w-[78px]">
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium',
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
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
