import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

export function AppLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/dashboard" className={cn('inline-flex items-center gap-3', className)}>
      <div className="shrink-0 rounded-2xl border border-border bg-white p-1.5">
        <Image
          src="/branding/pg2-mark.svg"
          alt="Panchsheel Greens II logo"
          width={compact ? 38 : 44}
          height={compact ? 38 : 44}
          priority
        />
      </div>
      <div className="leading-none">
        <p className="font-heading text-[1.2rem] font-semibold tracking-tight md:text-[1.38rem]">
          <span className="text-secondary/95">Panchsheel</span>{' '}
          <span className="text-primary">Greens-II</span>
        </p>
        {!compact ? (
          <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Resident Car Pool Network
          </p>
        ) : null}
      </div>
    </Link>
  );
}
