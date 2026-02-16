'use client';

import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { PwaSlide } from './pexels-slides';

type MobileImageCarouselProps = {
  slides: PwaSlide[];
  className?: string;
  autoPlayMs?: number;
};

export function MobileImageCarousel({
  slides,
  className,
  autoPlayMs = 4200,
}: MobileImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const safeSlides = useMemo(() => (slides.length > 0 ? slides : []), [slides]);
  const total = safeSlides.length;

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

  return (
    <section
      className={cn('relative overflow-hidden rounded-[2rem] border border-primary/20', className)}
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
        {safeSlides.map((slide) => (
          <article key={slide.imageUrl} className="relative min-w-full">
            <img
              src={slide.imageUrl}
              alt={slide.imageAlt}
              loading="lazy"
              className="h-full min-h-[360px] w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,34,30,0.08)_12%,rgba(8,34,30,0.68)_74%,rgba(8,34,30,0.88)_100%)]" />
          </article>
        ))}
      </div>

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

      <div className="absolute bottom-16 left-4 right-4 space-y-2 text-white">
        <p className="text-2xl font-semibold leading-tight">{active.title}</p>
        <p className="max-w-[36ch] text-sm text-white/90">{active.subtitle}</p>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
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
                slideIndex === index ? 'w-6 bg-white' : 'w-2.5 bg-white/35'
              )}
              aria-label={`Go to slide ${slideIndex + 1}`}
            />
          ))}
        </div>

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
      </div>
    </section>
  );
}
