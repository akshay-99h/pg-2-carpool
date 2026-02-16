'use client';

import { cn } from '@/lib/utils';
import { Loader2, Mail, RotateCcw } from 'lucide-react';
import Image from 'next/image';
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
      setStage('otp');
    } catch (errorValue) {
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
      router.push('/dashboard');
      router.refresh();
    } catch (errorValue) {
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
          router.push('/dashboard');
          router.refresh();
        } catch (errorValue) {
          setError(errorValue instanceof Error ? errorValue.message : 'Google login failed');
        }
      },
    });

    googleButtonRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: 'standard',
      theme: 'filled_blue',
      size: 'large',
      shape: 'pill',
      text: 'signin_with',
      width: `${googleButtonWidth}`,
    });
  }, [googleButtonWidth, googleClientId, googleReady, router]);

  return (
    <div className={cn('flex flex-col gap-6', mode === 'pwa' ? 'gap-3' : '', className)} {...props}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGoogleReady(true)}
      />
      <Card
        className={cn(
          'overflow-hidden rounded-3xl border border-border bg-white/90 p-0 shadow-[0_24px_50px_-35px_rgba(16,55,34,0.45)]',
          mode === 'pwa' ? 'border-primary/20 shadow-[0_20px_48px_-35px_rgba(16,55,34,0.45)]' : ''
        )}
      >
        <CardContent
          className={cn('grid p-0 md:grid-cols-2', mode === 'pwa' ? 'md:grid-cols-1' : '')}
        >
          <form
            className={cn('p-6 md:p-8', mode === 'pwa' ? 'p-5 md:p-5' : '')}
            onSubmit={onSubmit}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Login to your Panchsheel Greens-II car pool account
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
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
                    placeholder="123456"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    maxLength={6}
                    required
                  />
                </Field>
              ) : null}

              {error ? (
                <FieldDescription className="text-center text-red-700">{error}</FieldDescription>
              ) : null}

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
                By continuing, you agree to PG2 car pool community terms and safety rules.
              </FieldDescription>
            </FieldGroup>
          </form>

          <div
            className={cn(
              'relative hidden min-h-[520px] md:block',
              mode === 'pwa' ? 'md:hidden' : ''
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500" />
            <Image
              src="/branding/hero-cars.svg"
              alt="Residents sharing car pool routes"
              fill
              className="object-cover mix-blend-screen opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/35 bg-black/20 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/85">
                Resident-first commute
              </p>
              <p className="mt-2 text-sm font-medium text-white">
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
