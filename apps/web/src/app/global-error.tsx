'use client';

import { useEffect } from 'react';

import './globals.css';

export default function GlobalError({
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
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <main className="flex min-h-[100dvh] items-center justify-center px-5">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-6 text-center">
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              Car Pool PG2 could not start
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              An unexpected error stopped the app from loading. Please try again.
            </p>
            {error.digest ? (
              <p className="mt-2 font-mono text-[0.7rem] text-muted-foreground/80">
                Reference: {error.digest}
              </p>
            ) : null}
            <button
              type="button"
              onClick={reset}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
