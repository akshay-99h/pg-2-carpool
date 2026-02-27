import type { UserRole } from '@/lib/schemas';
import { ApprovalStatus } from '@prisma/client';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

import { SESSION_COOKIE } from '@/lib/constants';
import { db } from '@/lib/db';
import { env } from '@/lib/env';

const secret = new TextEncoder().encode(env.authSecret);
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
};

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== 'string') {
      return null;
    }
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export async function setSessionCookie(response: NextResponse, userId: string) {
  const token = await signSession({ userId });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const payload = await verifySession(token);
  if (!payload) {
    return null;
  }

  return db.user.findUnique({
    where: { id: payload.userId },
    include: { profile: true },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  return user;
}

export async function requireApprovedUser() {
  const user = await getCurrentUser();
  if (!user || user.approvalStatus !== ApprovalStatus.APPROVED) {
    return null;
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return null;
  }
  return user;
}

export function unauthorized() {
  const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  clearSessionCookie(response);
  return response;
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function getCurrentUserFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const payload = await verifySession(token);
  if (!payload) {
    return null;
  }

  return db.user.findUnique({
    where: { id: payload.userId },
    include: { profile: true },
  });
}

export function toClientRole(role: string): UserRole {
  return role === 'ADMIN' ? 'ADMIN' : 'USER';
}
