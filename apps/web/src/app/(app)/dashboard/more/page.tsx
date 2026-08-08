import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { LogoutButton } from '@/components/forms/logout-button';
import { mobileMoreNavItems } from '@/components/layout/nav-items';
import { Card, CardContent } from '@/components/ui/card';
import { requireProfileCompletion } from '@/server/auth-guards';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'More',
};

export default async function MorePage() {
  const user = await requireProfileCompletion();

  return (
    <div className="space-y-3">
      <h1 className="font-heading text-xl font-semibold tracking-tight">More</h1>

      <div className="grid gap-3 sm:grid-cols-2">
        {mobileMoreNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="h-full transition hover:border-primary/30 hover:bg-primary/5">
                <CardContent className="flex h-full items-start gap-3 p-4">
                  <div className="auth-subtle p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {user.role === 'ADMIN' ? (
          <Link href="/admin">
            <Card className="h-full transition hover:border-primary/30 hover:bg-primary/5">
              <CardContent className="flex h-full items-start gap-3 p-4">
                <div className="auth-subtle p-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Admin Portal</p>
                  <p className="text-xs text-muted-foreground">
                    Switch to approvals, analytics, contacts, and admin tools.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : null}
      </div>

      {/* Logout lives here rather than in the header of every screen. */}
      <div className="pt-1 md:hidden">
        <LogoutButton className="w-full justify-center" />
      </div>
    </div>
  );
}
