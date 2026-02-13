import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

import { OTP_MAX_ATTEMPTS, OTP_TTL_MINUTES } from '@/lib/constants';
import { db } from '@/lib/db';
import { env } from '@/lib/env';

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

export async function createOtp(email: string) {
  const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await db.otpToken.create({
    data: {
      email: email.toLowerCase(),
      otpHash,
      expiresAt,
    },
  });

  return otp;
}

export async function sendOtpEmail(email: string, otp: string) {
  if (!resend) {
    console.info(`OTP for ${email}: ${otp}`);
    return;
  }

  await resend.emails.send({
    from: env.emailFrom,
    to: email,
    subject: 'Your Car Pool PG2 login OTP',
    text: `Your OTP is ${otp}. It will expire in ${OTP_TTL_MINUTES} minutes.`,
  });
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
