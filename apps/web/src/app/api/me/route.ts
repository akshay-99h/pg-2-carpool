import { NextResponse } from 'next/server';

import { getCurrentUser, unauthorized } from '@/lib/auth/session';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role,
    approvalStatus: user.approvalStatus,
    profile: user.profile,
  });
}
