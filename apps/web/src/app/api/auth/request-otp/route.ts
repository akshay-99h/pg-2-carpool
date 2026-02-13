import { emailOtpRequestSchema } from '@/lib/schemas';
import { NextResponse } from 'next/server';

import { createOtp, sendOtpEmail } from '@/lib/auth/otp';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = emailOtpRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const recentCount = await db.otpToken.count({
      where: {
        email: parsed.data.email.toLowerCase(),
        createdAt: {
          gt: new Date(Date.now() - 60 * 1000),
        },
      },
    });

    if (recentCount >= 3) {
      return NextResponse.json(
        { error: 'Too many OTP attempts. Try again in a minute.' },
        { status: 429 }
      );
    }

    const otp = await createOtp(parsed.data.email);
    await sendOtpEmail(parsed.data.email, otp);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
