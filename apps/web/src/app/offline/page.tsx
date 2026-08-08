import { CloudOff } from 'lucide-react';
import type { Metadata } from 'next';

import { OfflineRetryButton } from '@/components/pwa/offline-retry-button';

export const metadata: Metadata = {
  title: 'You are offline',
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))]">
      <div className="surface-raised w-full max-w-sm rounded-2xl p-6 text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CloudOff className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-4 font-heading text-xl font-semibold tracking-tight">You are offline</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Car Pool PG2 needs a connection to load trips and bookings. Your session is safe. Reload
          once you are back on mobile data or Wi-Fi.
        </p>
        <OfflineRetryButton />
      </div>
    </main>
  );
}
