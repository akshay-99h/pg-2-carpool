'use client';

import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

import { trackEvent } from '@/lib/analytics';

/**
 * API requests deliberately bypass the service worker, so a dropped connection
 * previously surfaced only as a generic "Unable to fetch" per screen. This gives
 * that failure one clear, app-wide explanation.
 */
export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => {
      const isOffline = !navigator.onLine;
      // Only report the transition, not every re-check.
      setOffline((wasOffline) => {
        if (isOffline && !wasOffline) {
          trackEvent({ name: 'connection_lost' });
        }
        return isOffline;
      });
    };
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline) {
    return null;
  }

  return (
    <output
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[70] flex justify-center px-3 pt-[calc(0.5rem+env(safe-area-inset-top))]"
    >
      <p className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-900 shadow-sm">
        <WifiOff className="h-3.5 w-3.5" aria-hidden />
        You are offline. Showing the last loaded data.
      </p>
    </output>
  );
}
