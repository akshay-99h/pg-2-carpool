'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function TripPostedToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasShownRef = useRef(false);
  const posted = searchParams.get('posted') === '1';

  useEffect(() => {
    if (!posted || hasShownRef.current) {
      return;
    }

    hasShownRef.current = true;
    toast.success('Trip posted successfully.');
    router.replace('/dashboard/trips');
  }, [posted, router]);

  return null;
}
