import { NextResponse } from 'next/server';
import { z } from 'zod';

import { verifyGoogleIdToken } from '@/lib/auth/google';
import { setSessionCookie } from '@/lib/auth/session';
import { getOrCreateUserFromGoogle } from '@/lib/auth/user';

const schema = z.object({
  credential: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const payload = await verifyGoogleIdToken(parsed.data.credential);
    const user = await getOrCreateUserFromGoogle(payload);

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
    return NextResponse.json({ error: 'Google login failed' }, { status: 500 });
  }
}
