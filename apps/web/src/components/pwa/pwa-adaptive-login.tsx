'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { AppLogo } from '@/components/layout/app-logo';
import { MobileShell } from '@/components/layout/mobile-shell';

import { LoginForm } from '../forms/login-form';
import { useIsPwaMobile } from './use-pwa-mobile';

export function PwaAdaptiveLogin() {
  const isPwaMobile = useIsPwaMobile();

  if (isPwaMobile) {
    return (
      <main className="min-h-[100dvh] overflow-hidden bg-[linear-gradient(180deg,hsl(153_38%_93%)_0%,hsl(210_28%_98%)_54%,#ffffff_100%)] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        <section className="p-3 pb-0">
          <div className="rounded-[2rem] border border-primary/20 bg-[linear-gradient(145deg,hsl(152_75%_20%)_0%,hsl(152_71%_27%)_48%,hsl(152_33%_43%)_100%)] p-5 text-white shadow-[0_20px_42px_-30px_rgba(11,42,36,0.52)]">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-white/85 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Back
            </Link>
            <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight">
              Continue to your resident account
            </h1>
            <p className="mt-2 text-sm text-white/90">
              Sign in with your email OTP or Google account to reach your trips and bookings.
            </p>
          </div>
        </section>

        <section className="mt-3 rounded-t-[2.3rem] border-t border-border/70 bg-white/95 px-4 pt-5 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <AppLogo compact href="/" />
            <span className="status-chip rounded-full px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-primary">
              Secure Login
            </span>
          </div>
          <LoginForm mode="pwa" className="mt-3 pb-4" />
        </section>
      </main>
    );
  }

  return (
    <MobileShell withBottomInset={false} className="pt-5">
      <section className="mx-auto w-full max-w-5xl space-y-4">
        <div className="surface-raised flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <AppLogo compact href="/" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
        </div>
        <LoginForm />
      </section>
    </MobileShell>
  );
}
