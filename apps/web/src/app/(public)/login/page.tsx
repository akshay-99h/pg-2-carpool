import { redirect } from 'next/navigation';

import { PwaAdaptiveLogin } from '@/components/pwa/pwa-adaptive-login';
import { getCurrentUser } from '@/lib/auth/session';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return <PwaAdaptiveLogin />;
}
