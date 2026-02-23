import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

export function AppLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border/80 bg-white px-2.5 py-1.5 shadow-sm',
        className
      )}
    >
      <div className="shrink-0 overflow-hidden rounded-full border border-border/70 bg-white">
        <Image
          src="/branding/pg2-carpool-logo.jpg"
          alt="Panchsheel Greens II Car Pool logo"
          width={compact ? 34 : 40}
          height={compact ? 34 : 40}
          priority
          className="h-auto w-auto"
        />
      </div>
      <div className="leading-none">
        <p className="font-heading text-sm font-semibold tracking-tight md:text-base">
          <span className="text-primary">Car Pool</span>{' '}
          <span className="text-foreground/70">· PG2</span>
        </p>
        {compact ? null : (
          <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Resident Commute Network
          </p>
        )}
      </div>
    </Link>
  );
}
