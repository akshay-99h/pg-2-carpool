'use client';

import { BarChart3, ContactRound, ShieldCheck, UserCog, UserRoundCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const links = [
  { href: '/admin', label: 'Overview', icon: ShieldCheck },
  { href: '/admin/approvals', label: 'Approvals', icon: UserRoundCheck },
  { href: '/admin/ums', label: 'UMS', icon: UserCog },
  { href: '/admin/contacts', label: 'Contacts', icon: ContactRound },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="overflow-x-auto">
      <div className="flex min-w-max items-center gap-1">
        {links.map((item) => {
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition',
                active ? 'bg-primary/12 text-primary' : 'hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
