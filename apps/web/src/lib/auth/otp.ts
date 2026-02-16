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

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildOtpEmailHtml({ email, otp }: { email: string; otp: string }) {
  const safeEmail = escapeHtml(email.toLowerCase());
  const loginUrl = `${env.appUrl.replace(/\/$/, '')}/login`;
  const currentYear = new Date().getFullYear();

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Car Pool PG2 OTP</title>
  </head>
  <body style="margin:0;padding:0;background:#e8f8f5;font-family:'Inter','Segoe UI',Roboto,Arial,sans-serif;color:#163b33;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Your Car Pool PG2 login OTP is ${otp}. This code expires in ${OTP_TTL_MINUTES} minutes.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:20px;border:1px solid #cbe9e1;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(120deg,#0aaeb9 0%,#1ea773 62%,#f0fbf7 100%);padding:28px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td valign="middle">
                      <div style="display:inline-block;border-radius:999px;background:#ffffff;border:1px solid rgba(22,59,51,0.14);padding:7px 10px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0f6b57;">
                        Car Pool Panchsheel Greens 2
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:14px;">
                      <h1 style="margin:0;font-size:29px;line-height:1.15;color:#0e3d35;">
                        Your secure login code
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:8px;font-size:14px;line-height:1.6;color:#23584d;">
                      Use this OTP to continue your Car Pool booking and trip management.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 24px 10px;">
                <p style="margin:0 0 10px;font-size:14px;color:#4a645e;">
                  Login requested for
                  <span style="font-weight:700;color:#163b33;"> ${safeEmail}</span>
                </p>
                <div style="margin:0 auto 16px;max-width:320px;border-radius:16px;border:1px dashed #64bda9;background:#f3fcf9;padding:16px 18px;text-align:center;">
                  <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#3a7768;font-weight:700;">
                    One-time password
                  </div>
                  <div style="margin-top:8px;font-size:36px;letter-spacing:10px;font-weight:800;color:#0e4e42;">
                    ${otp}
                  </div>
                </div>
                <p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:#4a645e;">
                  This code expires in <strong>${OTP_TTL_MINUTES} minutes</strong>. Do not share it with anyone.
                </p>
                <div style="margin:0 0 20px;">
                  <a href="${loginUrl}" style="display:inline-block;border-radius:999px;background:#0f7f59;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:10px 18px;">
                    Open Car Pool Login
                  </a>
                </div>
                <p style="margin:0;font-size:12px;line-height:1.6;color:#5f7b74;">
                  If you did not request this OTP, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 24px 24px;border-top:1px solid #e7f3ef;font-size:11px;line-height:1.6;color:#73908a;">
                Car Pool Panchsheel Greens 2 · Greater Noida (West)<br />
                © ${currentYear} Car Pool PG2
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();
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
    html: buildOtpEmailHtml({ email, otp }),
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
