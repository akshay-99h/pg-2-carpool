import type { ReactNode } from 'react';

import { requireLoggedInUser } from '@/server/auth-guards';

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireLoggedInUser();
  return children;
}
