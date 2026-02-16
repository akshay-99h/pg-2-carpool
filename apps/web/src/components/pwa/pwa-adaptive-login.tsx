'use client';

import { AppLogo } from '@/components/layout/app-logo';
import { MobileShell } from '@/components/layout/mobile-shell';

import { LoginForm } from '../forms/login-form';
import { MobileImageCarousel } from './mobile-image-carousel';
import { pwaCommuteSlides } from './pexels-slides';
import { useIsPwaMobile } from './use-pwa-mobile';

export function PwaAdaptiveLogin() {
  const isPwaMobile = useIsPwaMobile();

  if (isPwaMobile) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#daf9f6_0%,#f9fefb_100%)] pb-[env(safe-area-inset-bottom)]">
        <section className="p-3 pb-0">
          <div className="h-[54vh]">
            <MobileImageCarousel
              slides={pwaCommuteSlides.slice(0, 4)}
              className="h-full"
              autoPlayMs={3600}
            />
          </div>
        </section>

        <section className="-mt-6 rounded-t-[2.1rem] border-t border-primary/20 bg-white/95 px-4 pt-4 backdrop-blur">
          <AppLogo compact />
          <p className="mt-2 text-sm text-muted-foreground">
            Residents-only access. Login with Email OTP or Google.
          </p>
          <LoginForm mode="pwa" className="mt-3 pb-4" />
        </section>
      </main>
    );
  }

  return (
    <MobileShell withBottomInset={false} className="pt-5">
      <section className="mx-auto w-full max-w-5xl space-y-4">
        <div className="rounded-2xl border border-border bg-white/80 px-4 py-3">
          <AppLogo compact />
        </div>
        <LoginForm />
      </section>
    </MobileShell>
  );
}
