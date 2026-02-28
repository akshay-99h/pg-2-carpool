'use client';

import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { PwaSlide } from './pexels-slides';

type MobileImageCarouselProps = {
  slides: PwaSlide[];
  className?: string;
  autoPlayMs?: number;
  mode?: 'default' | 'hero';
  heroContinueHref?: string;
};

export function MobileImageCarousel({
  slides,
  className,
  autoPlayMs = 4200,
  mode = 'default',
  heroContinueHref = '/login',
}: MobileImageCarouselProps) {
  const router = useRouter();
  const isHero = mode === 'hero';
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(!isHero);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const safeSlides = useMemo(() => (slides.length > 0 ? slides : []), [slides]);
  const total = safeSlides.length;

  useEffect(() => {
    if (safeSlides.length === 0) {
      return;
    }

    // Preload slide images in the background so swipes feel instant.
    const preloaded = safeSlides.map((slide) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = slide.imageUrl;
      return image;
    });

    return () => {
      for (const image of preloaded) {
        image.src = '';
      }
    };
  }, [safeSlides]);

  useEffect(() => {
    if (!autoplay || total <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, autoPlayMs);

    return () => window.clearInterval(timer);
  }, [autoplay, autoPlayMs, total]);

  const firstSlide = safeSlides[0];
  if (total === 0 || !firstSlide) {
    return null;
  }

  const active = safeSlides[index] ?? firstSlide;
  const isLastSlide = index >= total - 1;

  const goToNextSlide = () => {
    setAutoplay(false);
    if (isLastSlide) {
      router.push(heroContinueHref);
      return;
    }
    setIndex((current) => (current + 1) % total);
  };

  return (
    <section
      className={cn(
        'relative overflow-hidden border border-primary/20',
        isHero ? 'rounded-[2.25rem]' : 'rounded-[2rem]',
        className
      )}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
        touchStartY.current = event.touches[0]?.clientY ?? null;
      }}
      onTouchEnd={(event) => {
        const endX = event.changedTouches[0]?.clientX ?? null;
        const endY = event.changedTouches[0]?.clientY ?? null;
        const startX = touchStartX.current;
        const startY = touchStartY.current;
        touchStartX.current = null;
        touchStartY.current = null;

        if (startX === null || endX === null || startY === null || endY === null) {
          return;
        }

        const deltaX = endX - startX;
        const deltaY = endY - startY;
        if (Math.abs(deltaX) < 35 || Math.abs(deltaY) > 90) {
          return;
        }

        setAutoplay(false);
        if (deltaX < 0) {
          setIndex((current) => (current + 1) % total);
        } else {
          setIndex((current) => (current - 1 + total) % total);
        }
      }}
    >
      <div
        className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {safeSlides.map((slide, slideIndex) => (
          <article key={slide.imageUrl} className="relative h-full min-w-full">
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[1800ms] ease-out"
              style={{
                backgroundImage: `url(${slide.imageUrl})`,
                transform: slideIndex === index ? 'scale(1.04)' : 'scale(1)',
              }}
            />
            <span className="sr-only">{slide.imageAlt}</span>
            <div
              className={cn(
                'pointer-events-none absolute inset-0',
                isHero
                  ? 'bg-[linear-gradient(180deg,rgba(0,0,0,0.24)_2%,rgba(0,0,0,0.54)_44%,rgba(0,0,0,0.92)_100%)]'
                  : 'bg-[linear-gradient(180deg,rgba(8,34,30,0.08)_12%,rgba(8,34,30,0.68)_74%,rgba(8,34,30,0.88)_100%)]'
              )}
            />
          </article>
        ))}
      </div>

      {!isHero ? (
        <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
          <span className="rounded-full border border-white/35 bg-black/25 px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-white">
            {active.chip}
          </span>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-full border-white/40 bg-black/25 text-white hover:bg-black/40"
            onClick={() => setAutoplay((current) => !current)}
          >
            {autoplay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
        </div>
      ) : null}

      <div
        className={cn(
          'absolute left-4 right-4 space-y-2 text-white',
          isHero ? 'bottom-[calc(4.9rem+env(safe-area-inset-bottom))] text-center' : 'bottom-16'
        )}
      >
        <p className={cn('font-semibold leading-tight', isHero ? 'text-[2.35rem]' : 'text-2xl')}>
          {active.title}
        </p>
        <p
          className={cn('text-sm text-white/90', isHero ? 'mx-auto max-w-[32ch]' : 'max-w-[36ch]')}
        >
          {active.subtitle}
        </p>
      </div>

      <div
        className={cn(
          'absolute left-3 right-3 flex items-center gap-2',
          isHero
            ? 'bottom-[calc(9.4rem+env(safe-area-inset-bottom))] justify-center'
            : 'bottom-3 justify-between'
        )}
      >
        <div className={cn('flex items-center', isHero ? 'gap-2' : 'gap-1.5')}>
          {safeSlides.map((slide, slideIndex) => (
            <button
              key={slide.imageUrl}
              type="button"
              onClick={() => {
                setAutoplay(false);
                setIndex(slideIndex);
              }}
              className={cn(
                'h-2.5 rounded-full border border-white/35 transition-all',
                slideIndex === index ? 'w-6 bg-white' : 'w-2.5 bg-white/35',
                isHero ? 'h-2.5 border-white/30' : ''
              )}
              aria-label={`Go to slide ${slideIndex + 1}`}
            />
          ))}
        </div>

        {!isHero ? (
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full border-white/40 bg-black/25 text-white hover:bg-black/40"
              onClick={() => {
                setAutoplay(false);
                setIndex((current) => (current - 1 + total) % total);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full border-white/40 bg-black/25 text-white hover:bg-black/40"
              onClick={() => {
                setAutoplay(false);
                setIndex((current) => (current + 1) % total);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>

      {isHero ? (
        <div className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4">
          <Button
            type="button"
            onClick={goToNextSlide}
            className="h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white hover:bg-blue-500"
          >
            {isLastSlide ? 'Continue' : 'Next'}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
