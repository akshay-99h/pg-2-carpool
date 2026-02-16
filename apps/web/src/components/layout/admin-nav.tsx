'use client';

import { ContactRound, ShieldCheck, UserCog, UserRoundCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const links = [
  { href: '/admin', label: 'Overview', icon: ShieldCheck },
  { href: '/admin/approvals', label: 'Approvals', icon: UserRoundCheck },
  { href: '/admin/ums', label: 'UMS', icon: UserCog },
  { href: '/admin/contacts', label: 'Contacts', icon: ContactRound },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {links.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-xl border border-border bg-white/85 p-3 text-sm font-medium transition',
              active
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'text-foreground/85 hover:border-primary/20 hover:bg-accent'
            )}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {item.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
