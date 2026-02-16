'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { AppLogo } from '@/components/layout/app-logo';
import { Button } from '@/components/ui/button';

import { MobileImageCarousel } from './mobile-image-carousel';
import { pwaCommuteSlides } from './pexels-slides';
import { useIsPwaMobile } from './use-pwa-mobile';

export function PwaLandingOverlay() {
  const isPwaMobile = useIsPwaMobile();

  useEffect(() => {
    if (!isPwaMobile) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isPwaMobile]);

  if (!isPwaMobile) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[85] bg-[linear-gradient(180deg,#dbfaf6_0%,#f9fefb_100%)]">
      <div className="flex h-full flex-col p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="h-[60vh]">
          <MobileImageCarousel slides={pwaCommuteSlides} className="h-full" autoPlayMs={3800} />
        </div>

        <div className="-mt-5 rounded-[2rem] border border-primary/20 bg-white/95 p-4 backdrop-blur">
          <AppLogo compact />
          <p className="mt-3 text-sm text-muted-foreground">
            Swipe through commute stories and continue to secure login.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button asChild>
              <Link href="/login">Continue to Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Open App</Link>
            </Button>
          </div>

          <p className="mt-3 text-[0.7rem] text-muted-foreground">
            PWA experience uses interactive carousel cards. Mobile web remains unchanged.
          </p>
        </div>
      </div>
    </div>
  );
}
