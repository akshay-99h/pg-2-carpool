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

import { AppLogo } from '@/components/layout/app-logo';
import { MobileShell } from '@/components/layout/mobile-shell';
import { PwaLandingOverlay } from '@/components/pwa/pwa-landing-overlay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollLink } from '@/components/ui/scroll-link';
import { cn } from '@/lib/utils';

const benefits = [
  {
    title: 'Lower commute cost',
    detail: 'Split fuel, toll, and parking on every shared commute.',
    icon: BadgeIndianRupee,
  },
  {
    title: 'Verified Resident Safety',
    detail: 'Only approved PG2 residents can post and book rides.',
    icon: ShieldCheck,
  },
  {
    title: 'Greener Daily Commute',
    detail: 'Fewer vehicles and lower emissions for Panchsheel Greens 2.',
    icon: Leaf,
  },
  {
    title: 'Peak Hour Relief',
    detail: 'Less dependence on autos during rush hour and weather extremes.',
    icon: Clock3,
  },
];

const steps = [
  {
    title: 'Login in Seconds',
    detail: 'Use Email OTP or Google sign-in.',
    icon: Sparkles,
  },
  {
    title: 'Get Verified by Admin',
    detail: 'Submit tower, flat, role, and vehicle details for approval.',
    icon: ShieldCheck,
  },
  {
    title: 'Post and Join Rides',
    detail: 'Share daily or one-time trips, request seats, and confirm quickly.',
    icon: CarFront,
  },
];

const liveRides = [
  { route: 'PG2 → Noida Sector 62', seats: '2 seats left', time: '8:30 AM' },
  { route: 'PG2 → Connaught Place', seats: '1 seat left', time: '7:10 AM' },
  { route: 'PG2 → Pari Chowk', seats: '3 seats left', time: '9:00 AM' },
];

function PhoneFrame({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <article
      className={cn(
        'overflow-hidden rounded-[2rem] border border-slate-300/85 bg-white p-4',
        'shadow-[0_20px_45px_-34px_rgba(9,52,48,0.48)]',
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between text-[0.64rem] font-semibold uppercase tracking-[0.13em] text-slate-500">
        <span>9:41</span>
        <span>{title}</span>
      </div>
      {children}
    </article>
  );
}

function HeroShowcase() {
  return (
    <div className="relative grid gap-4 md:grid-cols-2 lg:block lg:h-[34rem]">
      <PhoneFrame
        title="Choose role"
        className="md:col-span-1 lg:absolute lg:left-0 lg:top-14 lg:w-[16rem] lg:-rotate-[14deg]"
      >
        <div className="space-y-3">
          <p className="text-2xl font-semibold leading-tight text-slate-900">
            Choose your commute role
          </p>
          <div className="rounded-2xl bg-cyan-100 px-3 py-2 text-sm font-medium text-slate-800">
            Continue as Passenger
          </div>
          <div className="rounded-2xl bg-cyan-50 px-3 py-2 text-sm font-medium text-slate-700">
            Continue as Car owner
          </div>
          <div className="relative mt-3 h-24 overflow-hidden rounded-2xl border border-slate-200">
            <Image
              src="/branding/hero-cars.svg"
              alt="Cars ready for PG2 rides"
              width={1200}
              height={760}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </PhoneFrame>

      <PhoneFrame
        title="Schedule"
        className="md:col-span-1 lg:absolute lg:left-[15.2rem] lg:top-0 lg:w-[17rem] lg:rotate-[7deg]"
      >
        <p className="text-2xl font-semibold leading-tight text-slate-900">
          Which time are you going?
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Date</p>
            <p className="font-semibold">April 4, 2026</p>
          </div>
          <div>
            <p className="text-slate-500">Time</p>
            <p className="font-semibold">08:00 AM</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-sm">
          {[8, 9, 10, 11, 12, 1, 2].map((value) => (
            <span
              key={value}
              className={cn(
                'rounded-full py-1.5 text-slate-700',
                value === 8 ? 'bg-cyan-400 font-semibold text-slate-950' : 'bg-slate-100'
              )}
            >
              {value}
            </span>
          ))}
        </div>
        <div className="mt-5 rounded-full bg-slate-950 px-3 py-2 text-center text-sm font-medium text-white">
          Set ride time
        </div>
      </PhoneFrame>

      <PhoneFrame
        title="Track ride"
        className="md:col-span-1 lg:absolute lg:right-[14.5rem] lg:top-28 lg:w-[16rem] lg:-rotate-[6deg]"
      >
        <p className="text-2xl font-semibold leading-tight text-slate-900">Track your ride</p>
        <p className="mt-2 text-xs text-slate-500">Know where your car owner is before pickup.</p>
        <div className="relative mt-4 h-28 rounded-2xl bg-slate-100">
          <div className="absolute left-6 top-8 h-12 w-[72%] rounded-[2rem] border-2 border-dashed border-slate-500/60" />
          <span className="absolute left-4 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-semibold text-slate-900">
            1
          </span>
          <span className="absolute left-1/2 top-2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-orange-400 text-xs font-semibold text-slate-900">
            2
          </span>
          <span className="absolute right-5 top-10 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 text-xs font-semibold text-slate-50">
            3
          </span>
        </div>
      </PhoneFrame>

      <PhoneFrame
        title="Ride feed"
        className="md:col-span-2 lg:absolute lg:right-0 lg:top-12 lg:w-[17rem] lg:rotate-[10deg]"
      >
        <p className="text-2xl font-semibold leading-tight text-slate-900">Available rides</p>
        <ul className="mt-4 space-y-2">
          {liveRides.map((ride) => (
            <li key={ride.route} className="rounded-2xl border border-slate-200 px-3 py-2">
              <p className="text-sm font-semibold text-slate-900">{ride.route}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>{ride.time}</span>
                <span>{ride.seats}</span>
              </div>
            </li>
          ))}
        </ul>
      </PhoneFrame>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <PwaLandingOverlay />
      <MobileShell withBottomInset={false} className="pt-2 md:pt-4">
        <section className="relative isolate overflow-hidden rounded-[2.4rem] border border-primary/20 bg-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_8%,rgba(10,185,198,0.22),transparent_32%),radial-gradient(circle_at_94%_6%,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_70%_84%,rgba(122,30,43,0.1),transparent_44%)]" />
          <div className="pointer-events-none absolute left-0 top-0 h-[54%] w-full bg-[linear-gradient(120deg,rgba(9,172,188,0.85)_0%,rgba(27,189,154,0.62)_38%,rgba(255,255,255,0.22)_38%,rgba(255,255,255,0.03)_100%)] lg:w-[65%]" />

          <div className="relative grid gap-10 px-5 py-8 md:px-8 md:py-10 xl:grid-cols-[0.9fr_1.1fr] xl:items-center">
            <div className="space-y-6">
              <AppLogo />

              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-primary/35 bg-white/90 px-2.5 py-1 text-[0.68rem] text-primary">
                  PG2 Commute Network | Panchsheel Greens 2
                </Badge>
                <span className="rounded-full border border-primary/20 bg-white/85 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Residents Only
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="max-w-[16ch] text-4xl font-semibold leading-[1.04] tracking-tight text-foreground md:text-[3.85rem]">
                  Shared rides, designed for everyday PG2 commuting.
                </h1>
                <p className="max-w-[58ch] text-sm text-muted-foreground md:text-base">
                  Post daily and one-time rides, request seats instantly, and reduce commute cost
                  without WhatsApp clutter.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/login">
                    Continue to Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-primary/30 bg-white/85">
                  <ScrollLink targetId="how-it-works">How It Works</ScrollLink>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-medium text-foreground">
                <span className="rounded-full border border-primary/20 bg-white px-3 py-1.5">
                  Daily + One-time rides
                </span>
                <span className="rounded-full border border-primary/20 bg-white px-3 py-1.5">
                  Admin-approved residents
                </span>
                <span className="rounded-full border border-primary/20 bg-white px-3 py-1.5">
                  Mobile app-like experience
                </span>
                <span className="rounded-full border border-primary/20 bg-white px-3 py-1.5">
                  Terms & safety rules
                </span>
              </div>
            </div>

            <HeroShowcase />
          </div>
        </section>

        <section
          id="how-it-works"
          className="rounded-[2rem] border border-border/80 bg-white px-5 py-6 md:px-8 md:py-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                How It Works
              </p>
              <h2 className="mt-2 max-w-[22ch] text-2xl font-semibold leading-tight md:text-3xl">
                Three steps to start commuting in Panchsheel Greens 2
              </h2>
            </div>
            <Button asChild variant="outline" className="border-primary/30">
              <Link href="/login">Open Login</Link>
            </Button>
          </div>

          <ol className="mt-7 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="border-t border-primary/20 pt-4">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                      Step {index + 1}
                    </span>
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.detail}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[2rem] border border-border/80 bg-white px-5 py-6 md:px-8 md:py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Shared Ride Benefits
            </p>
            <h2 className="mt-2 max-w-[20ch] text-2xl font-semibold leading-tight md:text-3xl">
              Why PG2 residents are shifting to shared rides
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {benefits.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="border-t border-border/80 pt-4">
                    <Icon className="h-4 w-4 text-primary" />
                    <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </article>
                );
              })}
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-[linear-gradient(155deg,rgba(14,109,67,1)_0%,rgba(25,147,96,1)_56%,rgba(36,181,126,1)_100%)] px-5 py-6 text-white md:px-6 md:py-8">
            <div className="pointer-events-none absolute -bottom-16 -right-10 h-52 w-52 rounded-full border border-white/20" />
            <div className="pointer-events-none absolute -top-16 -left-10 h-44 w-44 rounded-full border border-white/15" />

            <div className="relative space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                Ready to Begin
              </p>
              <h2 className="max-w-[14ch] text-2xl font-semibold leading-tight md:text-3xl">
                Start your first trip today.
              </h2>
              <p className="text-sm text-white/90">
                Works on mobile and desktop with admin-managed approvals.
              </p>

              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <UsersRound className="h-4 w-4" />
                  Car owner and passenger roles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Admin approval and UMS controls
                </li>
                <li className="flex items-center gap-2">
                  <BadgeIndianRupee className="h-4 w-4" />
                  Fixed route charge guidance
                </li>
              </ul>

              <div className="overflow-hidden rounded-2xl border border-white/30 bg-white/15">
                <Image
                  src="/branding/hero-cars.svg"
                  alt="PG2 commute visual"
                  width={1200}
                  height={760}
                  className="h-36 w-full object-cover"
                />
              </div>

              <Button
                asChild
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
              >
                <Link href="/login">Continue to Login</Link>
              </Button>
            </div>
          </article>
        </section>
      </MobileShell>
    </>
  );
}
