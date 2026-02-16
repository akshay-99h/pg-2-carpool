'use client';

import { ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-[85] overflow-hidden bg-[linear-gradient(180deg,#dbfaf6_0%,#f9fefb_100%)]">
      <div className="relative flex h-full flex-col p-3 pb-[calc(0.8rem+env(safe-area-inset-bottom))]">
        <div className="pointer-events-none absolute left-0 right-0 top-6 z-20 flex justify-center px-4">
          <div className="pointer-events-auto rounded-full border border-white/25 bg-black/20 px-4 py-2 backdrop-blur">
            <AppLogo compact className="text-white" />
          </div>
        </div>

        <div className="h-full">
          <MobileImageCarousel
            slides={pwaCommuteSlides}
            className="h-full"
            autoPlayMs={3800}
            mode="hero"
          />
        </div>

        <div className="absolute bottom-[calc(0.95rem+env(safe-area-inset-bottom))] left-5 right-5 z-20 space-y-2">
          <Button asChild className="h-12 rounded-2xl bg-slate-950 text-white hover:bg-slate-900">
            <Link href="/login">
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-center text-xs font-medium text-white/85">
            Swipe to explore and continue to login.
          </p>
        </div>
      </div>
    </div>
  );
}
