'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/fetcher';
import { formatDateTime } from '@/lib/format';

type BookingRequest = {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  createdAt: string;
  rider: {
    email?: string | null;
    profile?: {
      name: string;
      towerFlat: string;
    } | null;
  };
  trip: {
    fromLocation: string;
    toLocation: string;
    departAt: string;
    driver: {
      email?: string | null;
      profile?: {
        name: string;
        towerFlat: string;
      } | null;
    };
  };
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const BOOKING_PAGE_SIZE = 20;

export function BookingRevokeManager() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [activeRequestId, setActiveRequestId] = useState('');
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['admin-booking-requests', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(BOOKING_PAGE_SIZE),
      });
      if (search) {
        params.set('q', search);
      }

      return apiFetch<{ requests: BookingRequest[]; pagination: Pagination }>(
        `/api/admin/trip-requests?${params.toString()}`
      );
    },
    placeholderData: keepPreviousData,
  });

  const revokeMutation = useMutation({
    mutationFn: (requestId: string) =>
      apiFetch(`/api/trip-requests/${requestId}`, {
        method: 'DELETE',
      }),
    onMutate: (requestId) => {
      setStatus('');
      setActiveRequestId(requestId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-booking-requests'] });
      setStatus('Booking revoked successfully.');
    },
    onError: (errorValue) => {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Failed to revoke booking');
    },
    onSettled: () => {
      setActiveRequestId('');
    },
  });

  const applySearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const revokeBooking = async (requestId: string) => {
    const confirmRevoke = window.confirm('Revoke this booking request?');
    if (!confirmRevoke) {
      return;
    }

    await revokeMutation.mutateAsync(requestId);
  };

  const requests = bookingsQuery.data?.requests ?? [];
  const pagination = bookingsQuery.data?.pagination;
  const isLoading = bookingsQuery.isLoading;

  return (
    <Card className="auth-hero-card">
      <CardHeader>
        <CardTitle>Revoke Bookings</CardTitle>
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
            placeholder="Search passenger or driver name/email/flat"
          />
          <div className="flex gap-2">
            <Button type="button" onClick={applySearch} disabled={isLoading}>
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
              disabled={isLoading && !search}
            >
              Clear
            </Button>
          </div>
        </div>

        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Passenger</th>
                <th className="px-3 py-2">Driver</th>
                <th className="px-3 py-2">Trip</th>
                <th className="px-3 py-2">Departure</th>
                <th className="px-3 py-2">Booked At</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-t border-border align-top">
                  <td className="px-3 py-2">
                    <p className="font-semibold">{request.rider.profile?.name ?? 'Resident'}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.rider.profile?.towerFlat ?? 'PG2'}
                    </p>
                    <p className="text-xs text-muted-foreground">{request.rider.email ?? '-'}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-semibold">{request.trip.driver.profile?.name ?? 'Resident'}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.trip.driver.profile?.towerFlat ?? 'PG2'}
                    </p>
                    <p className="text-xs text-muted-foreground">{request.trip.driver.email ?? '-'}</p>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {request.trip.fromLocation} {'->'} {request.trip.toLocation}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {formatDateTime(request.trip.departAt)}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {formatDateTime(request.createdAt)}
                  </td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={
                        request.status === 'CONFIRMED'
                          ? 'success'
                          : request.status === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {request.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => revokeBooking(request.id)}
                      disabled={activeRequestId === request.id || revokeMutation.isPending}
                    >
                      {activeRequestId === request.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Revoke
                    </Button>
                  </td>
                </tr>
              ))}

              {!isLoading && requests.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-center text-sm text-muted-foreground" colSpan={7}>
                    No booking requests found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {pagination ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} requests)
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                disabled={isLoading || pagination.page <= 1}
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
                disabled={isLoading || pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
