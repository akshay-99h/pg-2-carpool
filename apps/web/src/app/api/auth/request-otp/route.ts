import { emailOtpRequestSchema } from '@/lib/schemas';
import { NextResponse } from 'next/server';

import { createOtp, sendOtpEmail } from '@/lib/auth/otp';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  let tokenId: string | null = null;

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

    const created = await createOtp(parsed.data.email);
    tokenId = created.tokenId;
    const delivery = await sendOtpEmail(parsed.data.email, created.otp);
    console.info('otp delivery queued', {
      provider: delivery.provider,
      messageId: 'id' in delivery ? delivery.id : null,
      hasToken: Boolean(tokenId),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (tokenId) {
      await db.otpToken.delete({ where: { id: tokenId } }).catch(() => undefined);
    }

    console.error(error);

    if (error instanceof Error) {
      if (
        error.message === 'OTP_EMAIL_PROVIDER_NOT_CONFIGURED' ||
        error.message === 'OTP_EMAIL_FROM_NOT_CONFIGURED'
      ) {
        return NextResponse.json(
          { error: 'Email delivery is not configured. Please contact support.' },
          { status: 500 }
        );
      }

      if (error.message === 'OTP_EMAIL_SEND_FAILED') {
        return NextResponse.json(
          { error: 'Unable to deliver OTP email right now. Please retry in a moment.' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
