import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/forms/login-form';
import { AppLogo } from '@/components/layout/app-logo';
import { MobileShell } from '@/components/layout/mobile-shell';
import { getCurrentUser } from '@/lib/auth/session';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
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
