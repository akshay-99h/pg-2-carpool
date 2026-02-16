'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { apiFetch } from '@/lib/fetcher';

type UserItem = {
  id: string;
  email?: string | null;
  role: 'USER' | 'ADMIN';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  profile?: {
    name: string;
    towerFlat: string;
  } | null;
};

type AdminInvite = {
  id: string;
  email: string;
  createdAt: string;
};

export function UmsManager() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeUserId, setActiveUserId] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    try {
      const [usersResponse, invitesResponse] = await Promise.all([
        apiFetch<{ users: UserItem[] }>('/api/admin/users'),
        apiFetch<{ invites: AdminInvite[] }>('/api/admin/invites'),
      ]);

      setUsers(usersResponse.users);
      setInvites(invitesResponse.invites);
    } catch (errorValue) {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Unable to load UMS data');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateUser = async (
    userId: string,
    patch: Partial<{ role: 'USER' | 'ADMIN'; approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' }>
  ) => {
    setActiveUserId(userId);
    setLoading(true);
    setStatus('');
    try {
      await apiFetch('/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ userId, ...patch }),
      });
      await load();
      setStatus('User updated successfully.');
    } catch (errorValue) {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Failed to update user');
    } finally {
      setLoading(false);
      setActiveUserId('');
    }
  };

  const addAdmin = async () => {
    setActiveUserId('');
    setLoading(true);
    setStatus('');
    try {
      await apiFetch('/api/admin/invites', {
        method: 'POST',
        body: JSON.stringify({ email: adminEmail }),
      });
      setAdminEmail('');
      await load();
      setStatus('Admin invite saved. User will become admin on login.');
    } catch (errorValue) {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Failed to add admin');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    const confirmDelete = window.confirm(
      'Delete this user account? This removes profile, trips, and booking data.'
    );

    if (!confirmDelete) {
      return;
    }

    setActiveUserId(userId);
    setLoading(true);
    setStatus('');
    try {
      await apiFetch('/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      });
      await load();
      setStatus('User deleted successfully.');
    } catch (errorValue) {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Failed to delete user');
    } finally {
      setLoading(false);
      setActiveUserId('');
    }
  };

  return (
    <div className="space-y-3">
      <Card className="auth-hero-card">
        <CardHeader>
          <CardTitle>Add admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="admin-email@example.com"
            value={adminEmail}
            onChange={(event) => setAdminEmail(event.target.value)}
          />
          <Button className="w-full" onClick={addAdmin} disabled={loading || !adminEmail}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Admin Invite
          </Button>
          <div className="space-y-2 pt-2">
            {invites.map((invite) => (
              <p key={invite.id} className="auth-subtle p-2 text-xs text-muted-foreground">
                {invite.email}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="auth-hero-card">
        <CardHeader>
          <CardTitle>User Management System (UMS)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="auth-tile space-y-2 p-3">
              <p className="text-sm font-semibold">{user.profile?.name ?? user.email}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">{user.profile?.towerFlat}</p>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={user.role}
                  onChange={(event) =>
                    updateUser(user.id, { role: event.target.value as 'USER' | 'ADMIN' })
                  }
                  disabled={loading && activeUserId === user.id}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </Select>
                <Select
                  value={user.approvalStatus}
                  onChange={(event) =>
                    updateUser(user.id, {
                      approvalStatus: event.target.value as 'PENDING' | 'APPROVED' | 'REJECTED',
                    })
                  }
                  disabled={loading && activeUserId === user.id}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </Select>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteUser(user.id)}
                disabled={loading && activeUserId === user.id}
                className="w-full"
              >
                {loading && activeUserId === user.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Delete User
              </Button>
            </div>
          ))}

          {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
