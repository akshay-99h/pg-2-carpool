'use client';

import Image from 'next/image';
import { useEffect } from 'react';

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
    <div className="fixed inset-0 z-[85] overflow-hidden bg-black">
      <div className="relative h-full">
        <div className="pointer-events-none absolute left-4 top-[calc(0.65rem+env(safe-area-inset-top))] z-20">
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 backdrop-blur-md">
            <Image
              src="/icons/icon-192.svg"
              alt="Car Pool PG2"
              width={18}
              height={18}
              className="rounded"
            />
            <span className="text-sm font-semibold text-white">Car Pool PG2</span>
          </div>
        </div>

        <MobileImageCarousel
          slides={pwaCommuteSlides}
          className="h-full rounded-none border-0"
          mode="hero"
        />
      </div>
    </div>
  );
}
