'use client';

import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function ContactManager() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await apiFetch<{ queries: Query[] }>('/api/contact');
      setQueries(response.queries);
    } catch (errorValue) {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Unable to load queries');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (id: string, statusValue: 'OPEN' | 'IN_PROGRESS' | 'CLOSED') => {
    try {
      await apiFetch('/api/contact', {
        method: 'PATCH',
        body: JSON.stringify({ id, status: statusValue }),
      });
      await load();
    } catch (errorValue) {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Failed to update query');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Queries</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        {queries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contact queries yet.</p>
        ) : null}

        {queries.map((query) => (
          <div
            key={query.id}
            className="space-y-2 rounded-xl border border-border bg-accent/55 p-3 text-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{query.name}</p>
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
            </div>
            <p className="text-muted-foreground">{query.mobile}</p>
            <p className="text-muted-foreground">{formatDateTime(query.createdAt)}</p>
            <p>{query.message}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus(query.id, 'IN_PROGRESS')}
              >
                In Progress
              </Button>
              <Button size="sm" onClick={() => updateStatus(query.id, 'CLOSED')}>
                Mark Closed
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
