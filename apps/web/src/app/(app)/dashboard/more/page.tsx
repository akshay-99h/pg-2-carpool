import Link from 'next/link';

import { mobileMoreNavItems } from '@/components/layout/nav-items';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireProfileCompletion } from '@/server/auth-guards';

export default async function MorePage() {
  await requireProfileCompletion();

  return (
    <div className="space-y-3">
      <Card className="auth-hero-card">
        <CardHeader>
          <CardTitle>More Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Additional Car Pool tools are grouped here so mobile navigation stays fast and clean.
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/trips/new">Post a New Trip</Link>
          </Button>
        </CardContent>
      </Card>

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
      </div>
    </div>
  );
}
