'use client';

import { AppLogo } from '@/components/layout/app-logo';
import { MobileShell } from '@/components/layout/mobile-shell';
import Link from 'next/link';

import { LoginForm } from '../forms/login-form';
import { useIsPwaMobile } from './use-pwa-mobile';

export function PwaAdaptiveLogin() {
  const isPwaMobile = useIsPwaMobile();

  if (isPwaMobile) {
    return (
      <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#daf9f6_0%,#f9fefb_100%)] pb-[env(safe-area-inset-bottom)]">
        <section className="p-3 pb-0">
          <div className="rounded-[2rem] border border-primary/20 bg-[linear-gradient(145deg,rgba(12,99,77,1)_0%,rgba(19,137,99,0.95)_45%,rgba(57,177,141,0.9)_100%)] p-5 text-white shadow-[0_20px_46px_-32px_rgba(8,67,56,0.58)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/85">
              Login
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight">
              Continue to your resident account
            </h1>
            <p className="mt-2 text-sm text-white/90">
              Splash and login are now separate pages in PWA.
            </p>
          </div>
        </section>

        <section className="mt-3 rounded-t-[2.3rem] border-t border-primary/20 bg-white/95 px-4 pt-5 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <AppLogo compact />
            <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-primary">
              Secure Login
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Residents-only access with Email OTP or Google sign-in.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            <Link href="/terms" className="font-medium underline hover:text-primary">Terms & Conditions</Link> and <Link href="/terms" className="font-medium underline hover:text-primary">Safety Rules</Link> apply to all resident trips.
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
