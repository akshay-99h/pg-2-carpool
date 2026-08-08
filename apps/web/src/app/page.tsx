import {
  ArrowRight,
  BadgeIndianRupee,
  CarFront,
  CheckCircle2,
  Clock3,
  Leaf,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AppLogo } from '@/components/layout/app-logo';
import { MobileShell } from '@/components/layout/mobile-shell';
import { PwaLandingOverlay } from '@/components/pwa/pwa-landing-overlay';
import { Button } from '@/components/ui/button';
import { ScrollLink } from '@/components/ui/scroll-link';
import { getCurrentUser } from '@/lib/auth/session';

// One label per intent: every route to the login uses this exact string.
const LOGIN_CTA = 'Continue to Login';

const benefits = [
  {
    title: 'Lower commute cost',
    detail: 'Split fuel, toll, and parking on every shared commute.',
    icon: BadgeIndianRupee,
  },
  {
    title: 'Verified resident safety',
    detail: 'Only approved PG2 residents can post and book rides.',
    icon: ShieldCheck,
  },
  {
    title: 'Greener daily commute',
    detail: 'Fewer vehicles and lower emissions for Panchsheel Greens 2.',
    icon: Leaf,
  },
  {
    title: 'Peak hour relief',
    detail: 'Less dependence on autos during rush hour and weather extremes.',
    icon: Clock3,
  },
];

// The step content is the label. No "Step 1 / Step 2" prefixes.
const steps = [
  {
    title: 'Login in seconds',
    detail: 'Use email OTP or Google sign-in.',
    icon: Sparkles,
  },
  {
    title: 'Get verified by admin',
    detail: 'Submit tower, flat, role, and vehicle details for approval.',
    icon: ShieldCheck,
  },
  {
    title: 'Post and join rides',
    detail: 'Share daily or one-time trips, request seats, and confirm quickly.',
    icon: CarFront,
  },
];

const trustChips = [
  'Daily and one-time rides',
  'Residents only, admin approved',
  'Install it as an app',
  'Terms and safety rules',
];

export default async function LandingPage() {
  // The installed PWA launches at `/`. Without this, an already-signed-in
  // resident lands on the marketing page every time they open the app.
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <>
      <PwaLandingOverlay />
      <MobileShell withBottomInset={false} className="pt-2 md:pt-4">
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-primary/15 bg-card md:rounded-[2.4rem]">
          {/* Soft tint anchored to the corners. The previous hard diagonal band
              sliced straight through the headline at every breakpoint. */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,hsl(var(--primary)/0.14),transparent_46%),radial-gradient(circle_at_100%_0%,hsl(152_45%_55%/0.12),transparent_40%)]" />

          {/* Hero stack is exactly four elements: brand mark, headline,
              subtext, CTAs. Trust chips live in their own section below. */}
          <div className="relative grid gap-7 px-5 py-6 md:px-8 md:py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-8">
            <div className="space-y-5">
              <AppLogo href="/" />

              <div className="space-y-3">
                {/* Five words at this scale keeps the headline to two lines at
                    desktop and three on a 375px phone. */}
                <h1 className="max-w-[16ch] text-[2.1rem] font-semibold leading-[1.06] tracking-tight text-foreground sm:text-5xl md:text-[3.2rem]">
                  Shared rides for PG2 commuters.
                </h1>
                <p className="max-w-[52ch] text-sm leading-relaxed text-muted-foreground md:text-base">
                  Post daily and one-time rides, request seats instantly, and cut commute cost
                  without the WhatsApp clutter.
                </p>
              </div>

              {/* Primary CTA stays inside the first viewport on a 375x812 phone. */}
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/login">
                    {LOGIN_CTA}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <ScrollLink targetId="how-it-works">How It Works</ScrollLink>
                </Button>
              </div>
            </div>

            {/* Real photography of the society, not a div-built fake app screen. */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-border/70 lg:aspect-[16/11]">
              <Image
                src="/branding/pwa-carousel/pg2-aerial.jpg"
                alt="Aerial view of the Panchsheel Greens 2 towers in Greater Noida"
                fill
                priority
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <ul className="flex flex-wrap gap-2 text-xs font-medium text-foreground">
          {trustChips.map((chip) => (
            <li key={chip} className="rounded-full border border-border/80 bg-card px-3 py-1.5">
              {chip}
            </li>
          ))}
        </ul>

        <section
          id="how-it-works"
          className="rounded-[2rem] border border-border/80 bg-card px-5 py-6 md:px-8 md:py-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="max-w-[22ch] text-2xl font-semibold leading-tight md:text-3xl">
              Three steps to start commuting in Panchsheel Greens 2
            </h2>
            <Button asChild variant="outline">
              <Link href="/login">{LOGIN_CTA}</Link>
            </Button>
          </div>

          <ol className="mt-7 grid gap-6 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="border-t border-primary/20 pt-4">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.detail}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[2rem] border border-border/80 bg-card px-5 py-6 md:px-8 md:py-8">
            <h2 className="max-w-[20ch] text-2xl font-semibold leading-tight md:text-3xl">
              Why PG2 residents are shifting to shared rides
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {benefits.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="border-t border-border/80 pt-4">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                    <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.detail}
                    </p>
                  </article>
                );
              })}
            </div>
          </article>

          {/* Lightest gradient stop is capped at 34% lightness so white body
              text clears WCAG AA (4.5:1) across the whole block, not just at
              the dark end. */}
          <article className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-[linear-gradient(155deg,hsl(152_55%_20%)_0%,hsl(152_52%_27%)_56%,hsl(152_48%_34%)_100%)] px-5 py-6 text-white md:px-6 md:py-8">
            <div className="pointer-events-none absolute -bottom-16 -right-10 h-52 w-52 rounded-full border border-white/20" />
            <div className="pointer-events-none absolute -top-16 -left-10 h-44 w-44 rounded-full border border-white/15" />

            <div className="relative space-y-4">
              <h2 className="max-w-[14ch] text-2xl font-semibold leading-tight md:text-3xl">
                Start your first trip today.
              </h2>
              <p className="text-sm leading-relaxed text-white">
                Works on mobile and desktop with admin-managed approvals.
              </p>

              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <UsersRound className="h-4 w-4 shrink-0" aria-hidden />
                  Car owner and passenger roles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                  Admin approval and resident verification
                </li>
                <li className="flex items-center gap-2">
                  <BadgeIndianRupee className="h-4 w-4 shrink-0" aria-hidden />
                  Fixed route charge guidance
                </li>
              </ul>

              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/25">
                <Image
                  src="/branding/pwa-carousel/pg2-community-drive.jpeg"
                  alt="Residents inside the Panchsheel Greens 2 complex"
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="object-cover"
                />
              </div>

              <Button
                asChild
                variant="secondary"
                className="w-full bg-white text-primary hover:bg-white/90 sm:w-auto"
              >
                <Link href="/login">{LOGIN_CTA}</Link>
              </Button>
            </div>
          </article>
        </section>
      </MobileShell>
    </>
  );
}
