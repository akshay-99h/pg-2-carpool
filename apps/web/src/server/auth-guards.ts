import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth/session';

export async function requireLoggedInUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireProfileCompletion() {
  const user = await requireLoggedInUser();
  if (!user.profile) {
    redirect('/onboarding');
  }
  return user;
}

export async function requireApprovedUser() {
  const user = await requireProfileCompletion();
  if (user.approvalStatus !== 'APPROVED') {
    redirect('/approval-pending');
  }
  return user;
}

export async function requireAdminUser() {
  const user = await requireProfileCompletion();
  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  return user;
}
