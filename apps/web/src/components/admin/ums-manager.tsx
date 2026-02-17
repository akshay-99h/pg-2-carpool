'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

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

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const USERS_PAGE_SIZE = 20;

export function UmsManager() {
  const [adminEmail, setAdminEmail] = useState('');
  const [activeUserId, setActiveUserId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(USERS_PAGE_SIZE),
      });
      if (search) {
        params.set('q', search);
      }
      return apiFetch<{ users: UserItem[]; pagination: Pagination }>(
        `/api/admin/users?${params.toString()}`
      );
    },
    placeholderData: keepPreviousData,
  });

  const invitesQuery = useQuery({
    queryKey: ['admin-invites'],
    queryFn: () => apiFetch<{ invites: AdminInvite[] }>('/api/admin/invites'),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({
      userId,
      patch,
    }: {
      userId: string;
      patch: Partial<{
        role: 'USER' | 'ADMIN';
        approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
      }>;
    }) =>
      apiFetch('/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ userId, ...patch }),
      }),
    onMutate: ({ userId }) => {
      setStatus('');
      setActiveUserId(userId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setStatus('User updated successfully.');
    },
    onError: (errorValue) => {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Failed to update user');
    },
    onSettled: () => {
      setActiveUserId('');
    },
  });

  const addAdminMutation = useMutation({
    mutationFn: () =>
      apiFetch('/api/admin/invites', {
        method: 'POST',
        body: JSON.stringify({ email: adminEmail }),
      }),
    onMutate: () => setStatus(''),
    onSuccess: async () => {
      setAdminEmail('');
      await queryClient.invalidateQueries({ queryKey: ['admin-invites'] });
      setStatus('Admin invite saved. User will become admin on login.');
    },
    onError: (errorValue) => {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Failed to add admin');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) =>
      apiFetch('/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      }),
    onMutate: (userId) => {
      setStatus('');
      setActiveUserId(userId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setStatus('User deleted successfully.');
    },
    onError: (errorValue) => {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Failed to delete user');
    },
    onSettled: () => {
      setActiveUserId('');
    },
  });

  const updateUser = async (
    userId: string,
    patch: Partial<{ role: 'USER' | 'ADMIN'; approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' }>
  ) => {
    await updateUserMutation.mutateAsync({ userId, patch });
  };

  const addAdmin = async () => {
    await addAdminMutation.mutateAsync();
  };

  const deleteUser = async (userId: string) => {
    const confirmDelete = window.confirm(
      'Delete this user account? This removes profile, trips, and booking data.'
    );

    if (!confirmDelete) {
      return;
    }

    await deleteUserMutation.mutateAsync(userId);
  };

  const applySearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const users = usersQuery.data?.users ?? [];
  const invites = invitesQuery.data?.invites ?? [];
  const pagination = usersQuery.data?.pagination;
  const isLoadingUsers = usersQuery.isLoading;
  const isLoadingInvites = invitesQuery.isLoading;
  const mutationBusy =
    updateUserMutation.isPending || addAdminMutation.isPending || deleteUserMutation.isPending;

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
          <Button
            className="w-full"
            onClick={addAdmin}
            disabled={addAdminMutation.isPending || !adminEmail}
          >
            {addAdminMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Admin Invite
          </Button>
          <div className="space-y-2 pt-2">
            {isLoadingInvites ? <p className="auth-subtle text-xs">Loading invites...</p> : null}
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
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  applySearch();
                }
              }}
              placeholder="Search by name, email, or flat"
            />
            <div className="flex gap-2">
              <Button type="button" onClick={applySearch} disabled={isLoadingUsers}>
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setPage(1);
                }}
                disabled={isLoadingUsers && !search}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Flat</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Approval</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-border align-top">
                    <td className="px-3 py-2 font-semibold">{user.profile?.name ?? '-'}</td>
                    <td className="px-3 py-2 text-muted-foreground">{user.email ?? '-'}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {user.profile?.towerFlat ?? '-'}
                    </td>
                    <td className="px-3 py-2">
                      <Select
                        value={user.role}
                        onChange={(event) =>
                          updateUser(user.id, { role: event.target.value as 'USER' | 'ADMIN' })
                        }
                        disabled={mutationBusy && activeUserId === user.id}
                        className="h-9"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </Select>
                    </td>
                    <td className="px-3 py-2">
                      <Select
                        value={user.approvalStatus}
                        onChange={(event) =>
                          updateUser(user.id, {
                            approvalStatus: event.target.value as
                              | 'PENDING'
                              | 'APPROVED'
                              | 'REJECTED',
                          })
                        }
                        disabled={mutationBusy && activeUserId === user.id}
                        className="h-9"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                      </Select>
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteUser(user.id)}
                        disabled={mutationBusy && activeUserId === user.id}
                        className="h-9 w-full"
                      >
                        {mutationBusy && activeUserId === user.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {!isLoadingUsers && users.length === 0 ? (
                  <tr className="border-t border-border">
                    <td colSpan={6} className="px-3 py-4 text-center text-sm text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {isLoadingUsers ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : null}

          {pagination ? (
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <p>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                  disabled={pagination.page <= 1 || isLoadingUsers}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPage((previous) => Math.min(pagination.totalPages, previous + 1))
                  }
                  disabled={pagination.page >= pagination.totalPages || isLoadingUsers}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}

          {usersQuery.isError ? (
            <p className="text-sm text-red-700">
              {usersQuery.error instanceof Error
                ? usersQuery.error.message
                : 'Unable to load UMS data'}
            </p>
          ) : null}

          {invitesQuery.isError ? (
            <p className="text-sm text-red-700">
              {invitesQuery.error instanceof Error
                ? invitesQuery.error.message
                : 'Unable to load admin invites'}
            </p>
          ) : null}

          {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
