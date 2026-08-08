'use client';

import { cn } from '@/lib/utils';
import { FileText, Loader2, Mail, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { trackEvent } from '@/lib/analytics';
import { apiFetch } from '@/lib/fetcher';

export function LoginForm({
  className,
  mode = 'default',
  ...props
}: React.ComponentProps<'div'> & {
  mode?: 'default' | 'pwa';
}) {
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
  const googleButtonWidth = mode === 'pwa' ? 280 : 320;

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleReady, setGoogleReady] = useState(false);

  const sendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      await apiFetch('/api/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      trackEvent({ name: 'login_otp_requested' });
      setStage('otp');
    } catch (errorValue) {
      trackEvent({ name: 'login_failed', props: { stage: 'otp_request' } });
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError('');

    try {
      await apiFetch('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      trackEvent({ name: 'login_otp_verified' });
      router.push('/dashboard');
      router.refresh();
    } catch (errorValue) {
      trackEvent({ name: 'login_failed', props: { stage: 'otp_verify' } });
      setError(errorValue instanceof Error ? errorValue.message : 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (stage === 'email') {
      await sendOtp();
      return;
    }
    await verifyOtp();
  };

  useEffect(() => {
    if (!googleReady) {
      return;
    }
    if (!window.google || !googleButtonRef.current || !googleClientId) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response) => {
        try {
          await apiFetch('/api/auth/google', {
            method: 'POST',
            body: JSON.stringify({ credential: response.credential }),
          });
          trackEvent({ name: 'login_google_completed' });
          router.push('/dashboard');
          router.refresh();
        } catch (errorValue) {
          trackEvent({ name: 'login_failed', props: { stage: 'google' } });
          setError(errorValue instanceof Error ? errorValue.message : 'Google login failed');
        }
      },
    });

    googleButtonRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: 'standard',
      // `outline` instead of `filled_blue`: the secondary sign-in path should
      // not out-shout the primary OTP action, and blue clashes with the brand.
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'signin_with',
      width: `${googleButtonWidth}`,
    });
  }, [googleButtonWidth, googleClientId, googleReady, router]);

  return (
    <div className={cn('flex flex-col gap-5', mode === 'pwa' ? 'gap-3' : '', className)} {...props}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGoogleReady(true)}
      />
      <Card
        className={cn(
          'overflow-hidden rounded-[1.6rem] border border-border/70 bg-white p-0 shadow-[0_20px_44px_-34px_rgba(13,30,29,0.35)]',
          mode === 'pwa' ? 'shadow-[0_16px_38px_-30px_rgba(13,30,29,0.35)]' : ''
        )}
      >
        <CardContent
          className={cn('grid p-0 md:grid-cols-2', mode === 'pwa' ? 'md:grid-cols-1' : '')}
        >
          <form
            className={cn('space-y-1 p-5 md:p-7', mode === 'pwa' ? 'p-5 md:p-5' : '')}
            onSubmit={onSubmit}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="font-heading text-2xl font-semibold tracking-tight">Welcome back</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Login to your Panchsheel Greens-II resident account
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={loading || stage === 'otp'}
                />
              </Field>

              {stage === 'otp' ? (
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="otp">6-digit OTP</FieldLabel>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                      onClick={() => {
                        setStage('email');
                        setOtp('');
                      }}
                    >
                      Use different email
                    </button>
                  </div>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    // Lets iOS/Android offer the emailed code straight from the
                    // keyboard instead of making people switch apps to copy it.
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    maxLength={6}
                    required
                  />
                  <FieldDescription>
                    We emailed a 6-digit code to {email}. It expires in a few minutes.
                  </FieldDescription>
                </Field>
              ) : null}

              <output aria-live="polite" className="block">
                {error ? (
                  <FieldDescription className="text-center text-destructive">
                    {error}
                  </FieldDescription>
                ) : null}
              </output>

              <Field className="grid gap-2">
                <Button
                  type="submit"
                  disabled={loading || !email || (stage === 'otp' && otp.length !== 6)}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {stage === 'email' ? (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send OTP
                    </>
                  ) : (
                    'Verify & Continue'
                  )}
                </Button>
                {stage === 'otp' ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={() => void sendOtp()}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Resend OTP
                  </Button>
                ) : null}
              </Field>

              <FieldSeparator>Or continue with</FieldSeparator>

              <Field>
                {googleClientId ? (
                  <div className="flex justify-center">
                    <div ref={googleButtonRef} className="min-h-11" />
                  </div>
                ) : (
                  <Button type="button" variant="outline" disabled>
                    Google login not configured
                  </Button>
                )}
              </Field>

              <FieldDescription className="text-center">
                By continuing, you agree to the community{' '}
                <Link
                  href="/terms"
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden />
                  Terms &amp; Safety Rules
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div
            className={cn(
              'relative hidden min-h-[520px] md:block',
              mode === 'pwa' ? 'md:hidden' : ''
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0d5a3a] via-[#1a7a57] to-[#9bc0b1]" />
            <Image
              src="/branding/hero-cars.svg"
              alt="Residents sharing car pool routes"
              fill
              className="object-cover mix-blend-screen opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
            {/* Opaque enough that the white copy stays readable whatever the
                photograph behind it does. */}
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/35 bg-slate-950/60 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
                Resident-first commute
              </p>
              <p className="mt-2 text-sm font-medium text-white/95">
                Safer rides, fair cost sharing, and cleaner daily travel for PG2.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <FieldDescription className={cn('px-2 text-center', mode === 'pwa' ? 'text-xs' : '')}>
        For approval support, contact PG2 admin team from the core society group.
      </FieldDescription>
    </div>
  );
}
