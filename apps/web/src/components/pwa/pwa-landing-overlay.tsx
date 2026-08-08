'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { MobileImageCarousel } from './mobile-image-carousel';
import { pwaCommuteSlides } from './pexels-slides';
import { useIsPwaMobile } from './use-pwa-mobile';

const INTRO_SEEN_KEY = 'pg2-carpool:intro-seen';

export function PwaLandingOverlay() {
  const isPwaMobile = useIsPwaMobile();
  // `undefined` until we have read storage, so we never flash the intro at
  // someone who has already been through it.
  const [introSeen, setIntroSeen] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    try {
      setIntroSeen(window.localStorage.getItem(INTRO_SEEN_KEY) === '1');
    } catch {
      setIntroSeen(false);
    }
  }, []);

  const markSeen = useCallback(() => {
    try {
      window.localStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      /* storage unavailable (private mode); intro simply shows again */
    }
  }, []);

  const visible = isPwaMobile && introSeen === false;

  useEffect(() => {
    if (!visible) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[85] overflow-hidden bg-black">
      <div className="relative h-full">
        <div className="pointer-events-none absolute left-4 top-[calc(0.65rem+env(safe-area-inset-top))] z-20">
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 backdrop-blur-md">
            <Image
              src="/icons/icon-192.png"
              alt=""
              width={18}
              height={18}
              className="rounded"
              aria-hidden
            />
            <span className="text-sm font-semibold text-white">Car Pool PG2</span>
          </div>
        </div>

        <MobileImageCarousel
          slides={pwaCommuteSlides}
          className="h-full rounded-none border-0"
          mode="hero"
          onLeave={markSeen}
        />
      </div>
    </div>
  );
}
