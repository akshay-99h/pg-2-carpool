import {
  ArrowRight,
  BadgeIndianRupee,
  CarFront,
  CarTaxiFront,
  CheckCircle2,
  Clock4,
  Leaf,
  Route,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { AppLogo } from '@/components/layout/app-logo';
import { MobileShell } from '@/components/layout/mobile-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollLink } from '@/components/ui/scroll-link';

const highlights = [
  {
    title: 'Save Money Daily',
    detail: 'Split fuel, toll, and parking with society members traveling on similar routes.',
    icon: BadgeIndianRupee,
    tint: 'from-emerald-500/20 to-lime-400/20',
  },
  {
    title: 'Safer Commute',
    detail: 'Admin-verified resident network with clear accountability and booking flow.',
    icon: ShieldCheck,
    tint: 'from-sky-500/20 to-cyan-400/20',
  },
  {
    title: 'Lower Stress',
    detail: 'Less auto dependency in peak hours and fewer unsafe ride situations.',
    icon: Sparkles,
    tint: 'from-orange-500/20 to-rose-400/20',
  },
];

const steps = [
  {
    title: 'Quick Login',
    detail: 'Use email OTP or Google sign-in for pilot access.',
    icon: Sparkles,
  },
  {
    title: 'Resident Approval',
    detail: 'Complete flat and role details for admin verification.',
    icon: ShieldCheck,
  },
  {
    title: 'Post & Book',
    detail: 'Create rides, request seats, and confirm instantly.',
    icon: Route,
  },
];

export default function LandingPage() {
  return (
    <MobileShell withBottomInset={false} className="pt-2 md:pt-4">
      <section className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-emerald-100 via-white to-amber-100 px-5 py-8 md:px-8 md:py-10 lg:px-10">
        <div className="pointer-events-none absolute -left-24 -top-16 h-72 w-72 rounded-full bg-emerald-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-56 w-[55%] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <AppLogo />

            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/30 bg-white/85 px-2.5 py-1 text-[0.68rem] text-primary">
                Pilot Access | Panchsheel Greens II
              </Badge>
              <span className="rounded-full border border-border/70 bg-white/80 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Residents Only
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="max-w-[15ch] text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
                Turn daily commute into a shared premium experience.
              </h1>
              <p className="max-w-[58ch] text-sm text-muted-foreground md:text-base">
                A vibrant carpool platform for PG2 residents to post rides, request seats, and
                reduce cost, chaos, and commute fatigue in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/login">
                  Continue to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-primary/30 bg-white/80">
                <ScrollLink targetId="how-it-works">How it works</ScrollLink>
              </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-300/55 bg-white/80 px-3 py-2 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.11em] text-muted-foreground">Trips</p>
                <p className="mt-1 text-base font-semibold">Daily + One-time</p>
              </div>
              <div className="rounded-xl border border-cyan-300/55 bg-white/80 px-3 py-2 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.11em] text-muted-foreground">Safety</p>
                <p className="mt-1 text-base font-semibold">Admin Approved</p>
              </div>
              <div className="rounded-xl border border-orange-300/55 bg-white/80 px-3 py-2 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.11em] text-muted-foreground">Install</p>
                <p className="mt-1 text-base font-semibold">PWA Ready</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-primary/25 bg-white/75 p-4 backdrop-blur-xl md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Live Commute Visual
                </p>
                <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-1 text-[0.65rem] font-semibold text-primary">
                  today
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border/80 bg-white">
                <Image
                  src="/branding/hero-cars.svg"
                  alt="Multiple cars driving for shared society commute"
                  width={1200}
                  height={760}
                  className="h-auto w-full"
                  priority
                />
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-border/80 bg-white px-3 py-2 text-xs">
                  <p className="text-muted-foreground">Active Rides</p>
                  <p className="mt-1 text-sm font-semibold">24+</p>
                </div>
                <div className="rounded-xl border border-border/80 bg-white px-3 py-2 text-xs">
                  <p className="text-muted-foreground">Avg Savings</p>
                  <p className="mt-1 text-sm font-semibold">Up to 50%</p>
                </div>
                <div className="rounded-xl border border-border/80 bg-white px-3 py-2 text-xs">
                  <p className="text-muted-foreground">Seat Match</p>
                  <p className="mt-1 text-sm font-semibold">Fast Search</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="grid gap-3 lg:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <article
              key={step.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-white p-5"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-orange-400" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Step {index + 1}
                  </span>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.detail}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="relative overflow-hidden rounded-2xl border border-border bg-white p-5"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.tint}`}
              />
              <div className="relative space-y-3">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.3fr_1fr]">
        <article className="rounded-2xl border border-border bg-white p-5">
          <h2 className="text-xl font-semibold md:text-2xl">Community guardrails</h2>
          <ul className="mt-4 divide-y divide-border text-sm">
            <li className="flex items-center gap-2 py-3">
              <UsersRound className="h-4 w-4 text-primary" />
              <span>Only verified residents can join and book rides.</span>
            </li>
            <li className="flex items-center gap-2 py-3">
              <Clock4 className="h-4 w-4 text-primary" />
              <span>Drivers and riders should follow committed timing strictly.</span>
            </li>
            <li className="flex items-center gap-2 py-3">
              <Route className="h-4 w-4 text-primary" />
              <span>Route and charge guidance remains transparent for everyone.</span>
            </li>
            <li className="flex items-center gap-2 py-3">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>No commercial use. Expense sharing only.</span>
            </li>
          </ul>
        </article>

        <article className="rounded-2xl border border-border bg-gradient-to-br from-primary to-emerald-500 p-5 text-white">
          <h2 className="text-xl font-semibold md:text-2xl">Start your account</h2>
          <p className="mt-3 text-sm text-white/90">
            Use the platform on desktop browser or install it as a mobile PWA app.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-white/30 bg-white/10 px-2 py-2">
              <CarFront className="mb-1 h-4 w-4" />
              Drivers
            </div>
            <div className="rounded-lg border border-white/30 bg-white/10 px-2 py-2">
              <CarTaxiFront className="mb-1 h-4 w-4" />
              Riders
            </div>
          </div>
          <div className="mt-4">
            <Button asChild variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Link href="/login">Start Registration</Link>
            </Button>
          </div>
        </article>
      </section>
    </MobileShell>
  );
}
