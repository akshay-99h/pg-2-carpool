'use client';

import { Loader2, RefreshCw, X } from 'lucide-react';

import { usePwaUpdate } from '@/hooks/use-pwa-update';
import { trackEvent } from '@/lib/analytics';

export function PwaUpdateBanner() {
  const { updateAvailable, updating, updateApp, dismissUpdate } = usePwaUpdate();

  const acceptUpdate = () => {
    trackEvent({ name: 'pwa_update_accepted' });
    updateApp();
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <output
      aria-live="polite"
      // Sits above the mobile bottom nav (and its safe-area inset) so the two
      // fixed elements never stack on top of each other.
      className="fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[60] block px-3 md:bottom-[calc(1rem+env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-primary/25 bg-primary px-3 py-2.5 text-primary-foreground shadow-[0_18px_34px_-20px_rgba(11,31,28,0.6)] md:max-w-lg">
        <RefreshCw className="h-5 w-5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">A new version is ready</p>
          <p className="truncate text-xs text-primary-foreground/80">
            Reload to get the latest updates.
          </p>
        </div>
        <button
          type="button"
          onClick={acceptUpdate}
          disabled={updating}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 text-sm font-semibold text-primary transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-70"
        >
          {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
          {updating ? 'Updating' : 'Reload'}
        </button>
        <button
          type="button"
          onClick={dismissUpdate}
          aria-label="Dismiss update notice"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary-foreground/80 transition hover:bg-white/15 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </output>
  );
}
