import { OAuth2Client } from 'google-auth-library';

import { env } from '@/lib/env';

const client = new OAuth2Client(env.googleClientId);

export async function verifyGoogleIdToken(idToken: string) {
  if (!env.googleClientId) {
    throw new Error('Google client id missing');
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !payload.sub) {
    throw new Error('Invalid Google token payload');
  }

  return {
    email: payload.email,
    name: payload.name,
    sub: payload.sub,
  };
}
