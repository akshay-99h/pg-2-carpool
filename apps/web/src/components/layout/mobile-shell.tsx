import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function MobileShell({
  children,
  className,
  withBottomInset = true,
}: {
  children: ReactNode;
  className?: string;
  withBottomInset?: boolean;
}) {
  return (
    <main className="min-h-screen px-3 pb-8 pt-4 md:px-6 md:pb-10 md:pt-7">
      <div className="mx-auto w-full max-w-[1180px]">
        <div
          className={cn(
            'space-y-4 md:space-y-6',
            withBottomInset ? 'pb-24 md:pb-8' : '',
            className
          )}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
