const required = ['DATABASE_URL', 'AUTH_SECRET'] as const;
const isProduction = process.env.NODE_ENV === 'production';

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Missing environment variable: ${key}`);
  }
}

if (isProduction && !process.env.RESEND_API_KEY) {
  console.warn('Missing environment variable: RESEND_API_KEY');
}

if (isProduction && (!process.env.EMAIL_FROM || /example\.com/i.test(process.env.EMAIL_FROM))) {
  console.warn('EMAIL_FROM should be set to a verified sending identity in production.');
}

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? '',
  authSecret: process.env.AUTH_SECRET ?? 'replace-me',
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'Car Pool Panchsheel Greens 2 <car_admin@akxost.com>',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
  publicGoogleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
  publicGoogleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  contactCaptchaPhrase: process.env.CONTACT_CAPTCHA_PHRASE ?? 'PG2SAFE',
  bootstrapAdminEmails: (process.env.ADMIN_BOOTSTRAP_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
};
