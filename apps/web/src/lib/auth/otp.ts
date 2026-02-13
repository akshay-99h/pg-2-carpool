import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

import { OTP_MAX_ATTEMPTS, OTP_TTL_MINUTES } from '@/lib/constants';
import { db } from '@/lib/db';
import { env } from '@/lib/env';

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;
const isProduction = process.env.NODE_ENV === 'production';

function isPlaceholderFromAddress(emailFrom: string) {
  return /example\.com/i.test(emailFrom);
}

export async function createOtp(email: string) {
  const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  const token = await db.otpToken.create({
    data: {
      email: email.toLowerCase(),
      otpHash,
      expiresAt,
    },
  });

  return { otp, tokenId: token.id };
}

export async function sendOtpEmail(email: string, otp: string) {
  if (!resend) {
    if (isProduction) {
      throw new Error('OTP_EMAIL_PROVIDER_NOT_CONFIGURED');
    }
    console.info(`OTP for ${email}: ${otp}`);
    return { provider: 'console' as const };
  }

  if (isProduction && isPlaceholderFromAddress(env.emailFrom)) {
    throw new Error('OTP_EMAIL_FROM_NOT_CONFIGURED');
  }

  const { data, error } = await resend.emails.send({
    from: env.emailFrom,
    to: email,
    subject: 'Your Car Pool PG2 login OTP',
    text: `Your OTP is ${otp}. It will expire in ${OTP_TTL_MINUTES} minutes.`,
  });

  if (error) {
    console.error('OTP email provider error', {
      name: error.name,
      message: error.message,
      to: email,
    });
    throw new Error('OTP_EMAIL_SEND_FAILED');
  }

  if (!data?.id) {
    console.error('OTP email send response missing id', { to: email });
    throw new Error('OTP_EMAIL_SEND_FAILED');
  }

  return { provider: 'resend' as const, id: data.id };
}

export async function verifyOtp(email: string, otp: string) {
  const token = await db.otpToken.findFirst({
    where: {
      email: email.toLowerCase(),
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!token) {
    return false;
  }

  if (token.attempts >= OTP_MAX_ATTEMPTS) {
    return false;
  }

  const matches = await bcrypt.compare(otp, token.otpHash);
  if (!matches) {
    await db.otpToken.update({
      where: { id: token.id },
      data: { attempts: token.attempts + 1 },
    });
    return false;
  }

  await db.otpToken.update({
    where: { id: token.id },
    data: { usedAt: new Date() },
  });

  return true;
}
