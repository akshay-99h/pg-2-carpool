import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

export function AppLogo({
  className,
  compact = false,
  // Public pages must not point the logo at /dashboard - an unauthenticated
  // tap there just bounces through a redirect back to login.
  href = '/dashboard',
}: {
  className?: string;
  compact?: boolean;
  href?: string;
}) {
  const size = compact ? 34 : 40;

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border/80 bg-white px-2.5 py-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        className
      )}
    >
      <div className="shrink-0 overflow-hidden rounded-full border border-border/70 bg-white">
        <Image
          src="/branding/pg2-carpool-logo.jpg"
          alt="Panchsheel Greens II Car Pool"
          width={size}
          height={size}
          priority
          style={{ width: size, height: size }}
          className="object-cover"
        />
      </div>
      <div className="leading-none">
        <p className="font-heading text-sm font-semibold tracking-tight md:text-base">
          <span className="text-primary">Car Pool</span>{' '}
          <span className="text-foreground/70">· PG2</span>
        </p>
        {compact ? null : (
          <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Resident Commute Network
          </p>
        )}
      </div>
    </Link>
  );
}
