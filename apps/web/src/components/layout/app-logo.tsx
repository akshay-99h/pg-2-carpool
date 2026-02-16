import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

export function AppLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/dashboard" className={cn('inline-flex items-center gap-3', className)}>
      <div className="shrink-0 overflow-hidden rounded-full border border-border bg-white">
        <Image
          src="/branding/pg2-carpool-logo.jpg"
          alt="Panchsheel Greens II Car Pool logo"
          width={compact ? 44 : 52}
          height={compact ? 44 : 52}
          priority
          className="h-auto w-auto"
        />
      </div>
      <div className="leading-none">
        <p className="font-heading text-[1.14rem] font-semibold tracking-tight md:text-[1.3rem]">
          <span className="text-primary">Car Pool</span>{' '}
          <span className="text-secondary/95">Panchsheel Greens-II</span>
        </p>
        <p className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {compact ? 'PG2 Resident Network' : 'Resident Car Pool Network'}
        </p>
      </div>
    </Link>
  );
}
