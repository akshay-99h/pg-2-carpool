'use client';

import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/fetcher';

type UserItem = {
  id: string;
  email?: string | null;
  role: 'USER' | 'ADMIN';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  profile?: {
    name: string;
    towerFlat: string;
    mobileNumber: string;
  } | null;
};

export function ApprovalsManager() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await apiFetch<{ users: UserItem[] }>('/api/admin/users');
      setUsers(response.users.filter((item) => item.approvalStatus === 'PENDING'));
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to load pending users');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateApproval = async (userId: string, approvalStatus: 'APPROVED' | 'REJECTED') => {
    try {
      await apiFetch('/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ userId, approvalStatus }),
      });
      await load();
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Action failed');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending approvals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending registrations.</p>
        ) : null}

        {users.map((user) => (
          <div key={user.id} className="rounded-xl border border-border bg-accent/55 p-3 text-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">{user.profile?.name ?? user.email ?? 'Resident'}</p>
              <Badge variant="warning">PENDING</Badge>
            </div>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-muted-foreground">{user.profile?.towerFlat}</p>
            <p className="text-muted-foreground">{user.profile?.mobileNumber}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => updateApproval(user.id, 'APPROVED')}>
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateApproval(user.id, 'REJECTED')}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
