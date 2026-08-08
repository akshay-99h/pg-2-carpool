import { redirect } from 'next/navigation';

import { PwaAdaptiveLogin } from '@/components/pwa/pwa-adaptive-login';
import { getCurrentUser } from '@/lib/auth/session';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return <PwaAdaptiveLogin />;
}
