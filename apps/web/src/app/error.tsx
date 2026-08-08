'use client';

import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))]">
      <div className="surface-raised w-full max-w-sm rounded-2xl p-6 text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-4 font-heading text-xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This screen failed to load. Retrying usually fixes it. If it keeps happening, contact the
          PG2 admin team.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-[0.7rem] text-muted-foreground/80">
            Reference: {error.digest}
          </p>
        ) : null}
        <div className="mt-5 space-y-2">
          <Button type="button" className="w-full" onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
            Try again
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" aria-hidden />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
