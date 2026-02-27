import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { requireAdminUser } from '@/server/auth-guards';

export default async function AdminPage() {
  await requireAdminUser();
  const now = new Date();

  const [totalUsers, pendingUsers, totalTrips, openContacts] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { approvalStatus: 'PENDING' } }),
    db.trip.count({
      where: {
        status: 'ACTIVE',
        OR: [
          { tripType: 'DAILY' },
          {
            tripType: 'ONE_TIME',
            departAt: { gt: now },
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        ],
      },
    }),
    db.contactQuery.count({ where: { status: { not: 'CLOSED' } } }),
  ]);

  return (
    <div className="space-y-3">
      <Card className="auth-hero-card">
        <CardHeader>
          <CardTitle>Admin Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-sm">
          <div className="auth-tile p-3">
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="mt-1 text-2xl font-semibold">{totalUsers}</p>
          </div>
          <div className="auth-tile p-3">
            <p className="text-xs text-muted-foreground">Pending Approvals</p>
            <p className="mt-1 text-2xl font-semibold">{pendingUsers}</p>
          </div>
          <div className="auth-tile p-3">
            <p className="text-xs text-muted-foreground">Active Trips</p>
            <p className="mt-1 text-2xl font-semibold">{totalTrips}</p>
          </div>
          <div className="auth-tile p-3">
            <p className="text-xs text-muted-foreground">Open Queries</p>
            <p className="mt-1 text-2xl font-semibold">{openContacts}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="auth-hero-card">
        <CardHeader>
          <CardTitle className="text-lg">Admin actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <Button asChild>
            <Link href="/admin/approvals">Review Approvals</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/ums">Open UMS</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/contacts">Contact Inbox</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/content">Content Settings</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/analytics">Analytics</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
