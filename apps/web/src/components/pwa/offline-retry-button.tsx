'use client';

import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

export function OfflineRetryButton() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return (
    <div className="mt-5 space-y-2">
      <Button type="button" className="w-full" onClick={() => window.location.reload()}>
        <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
        Try again
      </Button>
      <p aria-live="polite" className="text-xs text-muted-foreground">
        {online ? 'Connection is back. Tap to reload.' : 'Still waiting for a connection.'}
      </p>
    </div>
  );
}
