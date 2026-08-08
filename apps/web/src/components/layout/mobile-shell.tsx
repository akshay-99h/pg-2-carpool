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
    // The viewport is `viewport-fit=cover`, so the shell owns the safe-area
    // padding: top clears the status bar / notch in standalone mode, and the
    // horizontal insets keep content off the rounded corners in landscape.
    <main
      id="main-content"
      className="min-h-[100dvh] px-[calc(1rem+env(safe-area-inset-left))] pb-8 pt-[calc(1rem+env(safe-area-inset-top))] pr-[calc(1rem+env(safe-area-inset-right))] md:px-6 md:pb-10 md:pt-7"
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <div
          className={cn(
            'space-y-4 md:space-y-6',
            // Clears the fixed bottom nav (label row included) plus its inset.
            withBottomInset ? 'pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8' : '',
            className
          )}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
