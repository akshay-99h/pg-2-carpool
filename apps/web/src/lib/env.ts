const required = ['DATABASE_URL', 'AUTH_SECRET'] as const;

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Missing environment variable: ${key}`);
  }
}

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? '',
  authSecret: process.env.AUTH_SECRET ?? 'replace-me',
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'Car Pool PG2 <noreply@example.com>',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
  publicGoogleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
  publicGoogleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  bootstrapAdminEmails: (process.env.ADMIN_BOOTSTRAP_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
};
