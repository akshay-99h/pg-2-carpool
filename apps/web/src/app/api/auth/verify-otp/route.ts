import { emailOtpVerifySchema } from '@/lib/schemas';
import { NextResponse } from 'next/server';

import { verifyOtp } from '@/lib/auth/otp';
import { setSessionCookie } from '@/lib/auth/session';
import { getOrCreateUserFromEmail } from '@/lib/auth/user';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = emailOtpVerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const valid = await verifyOtp(parsed.data.email, parsed.data.otp);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    const user = await getOrCreateUserFromEmail(parsed.data.email);
    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
    });
    await setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
