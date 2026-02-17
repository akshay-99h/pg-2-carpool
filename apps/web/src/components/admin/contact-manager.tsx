'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { apiFetch } from '@/lib/fetcher';
import { formatDateTime } from '@/lib/format';

type Query = {
  id: string;
  name: string;
  mobile: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  createdAt: string;
  user?: {
    profile?: {
      name: string;
      towerFlat: string;
    } | null;
  } | null;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const CONTACT_PAGE_SIZE = 20;

export function ContactManager() {
  const [status, setStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const contactQuery = useQuery({
    queryKey: ['contact-queries', page, statusFilter, search],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(CONTACT_PAGE_SIZE),
      });
      if (statusFilter) {
        params.set('status', statusFilter);
      }
      if (search) {
        params.set('q', search);
      }
      return apiFetch<{ queries: Query[]; pagination: Pagination }>(
        `/api/contact?${params.toString()}`
      );
    },
    placeholderData: keepPreviousData,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      statusValue,
    }: { id: string; statusValue: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' }) =>
      apiFetch('/api/contact', {
        method: 'PATCH',
        body: JSON.stringify({ id, status: statusValue }),
      }),
    onMutate: () => setStatus(''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['contact-queries'] });
    },
    onError: (errorValue) => {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Failed to update query');
    },
  });

  const updateStatus = async (id: string, statusValue: 'OPEN' | 'IN_PROGRESS' | 'CLOSED') => {
    await updateStatusMutation.mutateAsync({ id, statusValue });
  };

  const applySearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const queries = contactQuery.data?.queries ?? [];
  const pagination = contactQuery.data?.pagination;
  const isLoading = contactQuery.isLoading;

  return (
    <Card className="auth-hero-card">
      <CardHeader>
        <CardTitle>Contact Queries</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 md:grid-cols-[220px_1fr_auto_auto]">
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="CLOSED">CLOSED</option>
          </Select>
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                applySearch();
              }
            }}
            placeholder="Search name, mobile, message"
          />
          <Button onClick={applySearch} disabled={isLoading}>
            Search
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSearchInput('');
              setSearch('');
              setPage(1);
            }}
            disabled={!search && !searchInput}
          >
            Clear
          </Button>
        </div>

        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Mobile</th>
                <th className="px-3 py-2">Submitted</th>
                <th className="px-3 py-2">Message</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((query) => (
                <tr key={query.id} className="border-t border-border align-top">
                  <td className="px-3 py-2 font-semibold">{query.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{query.mobile}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {formatDateTime(query.createdAt)}
                  </td>
                  <td className="max-w-sm px-3 py-2">
                    <p className="line-clamp-3 text-muted-foreground">{query.message}</p>
                  </td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={
                        query.status === 'CLOSED'
                          ? 'success'
                          : query.status === 'IN_PROGRESS'
                            ? 'warning'
                            : 'secondary'
                      }
                    >
                      {query.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex min-w-44 flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(query.id, 'IN_PROGRESS')}
                        disabled={updateStatusMutation.isPending}
                      >
                        In Progress
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateStatus(query.id, 'CLOSED')}
                        disabled={updateStatusMutation.isPending}
                      >
                        Mark Closed
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && queries.length === 0 ? (
                <tr className="border-t border-border">
                  <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground">
                    No contact queries yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading contact queries...</p>
        ) : null}

        {pagination ? (
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} queries)
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                disabled={pagination.page <= 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((previous) => Math.min(pagination.totalPages, previous + 1))}
                disabled={pagination.page >= pagination.totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}

        {contactQuery.isError ? (
          <p className="text-sm text-red-700">
            {contactQuery.error instanceof Error
              ? contactQuery.error.message
              : 'Unable to load queries'}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
