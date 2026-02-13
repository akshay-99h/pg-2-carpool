# Car Pool Panchsheel Greens 2 Monorepo

Mobile-first carpool platform for Panchsheel Greens 2 with:
- `apps/web`: Next.js 16 (App Router, TypeScript, Tailwind, shadcn-style UI, PWA, desktop+mobile optimized)
- `apps/mobile`: Expo mobile scaffold (NativeWind)
- `packages/types`: Shared Zod schemas and TS types
- `packages/config`: Shared config presets

## Tech Stack
- Monorepo: pnpm workspaces
- Web: Next.js 16 + Prisma + Postgres + Biome
- Auth (pilot): Email OTP via Resend + Google login (ID token flow)
- Roles: USER / ADMIN
- Approval gate: PENDING / APPROVED / REJECTED

## Core Pilot Features
- Registration (name, tower/flat, commute role, vehicle no, mobile)
- Login via email OTP and optional Google login
- Admin approval required before ride actions
- Post trip (Daily / One-time)
- One-time trip auto-expiry after 1 hour
- Search rides by source/route/destination
- Ride booking request + driver confirmation
- Pool request posting board
- Route map view
- Charges list and terms pages
- Contact-us submission
- Admin portal: approvals, UMS, add-admin invites, contact inbox, content management

## Project Structure
- `/apps/web/src/app/(public)` login/onboarding/approval pages
- `/apps/web/src/app/(app)/dashboard` user app routes
- `/apps/web/src/app/(app)/admin` admin routes
- `/apps/web/src/app/api` API routes
- `/apps/web/prisma/schema.prisma` database schema

## Vercel Deployment (Next.js App Only)
1. Deploy only `apps/web` (or set Vercel Root Directory to `apps/web`).
2. `apps/web/vercel.json` is preconfigured.
3. Add required environment variables in Vercel project settings.
4. Push to git and deploy.

`apps/web` is now standalone-deployable and does not depend on monorepo workspace packages.

## Docker Quick Start (Recommended)
1. Make sure Docker Desktop is running.
2. From project root, start everything:
   - `docker compose up --build`
3. Open:
   - `http://localhost:3000`
4. First admin login:
   - default bootstrap admin email is `admin@example.com`
   - change with env var `ADMIN_BOOTSTRAP_EMAILS`
5. If ports are busy:
   - change app port with `APP_PORT` (default `3000`)
   - change DB port with `DB_PORT` (default `5432`)
6. To stop:
   - `docker compose down`
7. To fully reset DB data:
   - `docker compose down -v`

### Optional Custom Environment (Docker)
- Create env file (optional):
  - `cp .env.docker.example .env`
- Then run:
  - `docker compose up --build`
- Compose automatically reads root `.env`.

## Quick Start
1. Install dependencies:
   - `pnpm install`
2. Copy env file:
   - `cp apps/web/.env.example apps/web/.env`
3. Configure env values in `apps/web/.env`.
4. Generate Prisma client and push schema:
   - `pnpm --filter @carpool/web db:generate`
   - `pnpm --filter @carpool/web db:push`
5. Seed defaults:
   - `pnpm --filter @carpool/web db:seed`
6. Run apps:
   - Web only: `pnpm --filter @carpool/web dev`
   - Monorepo dev: `pnpm dev`

## Required Environment Variables (Web)
- `DATABASE_URL`
- `AUTH_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (optional fallback exists)
- `ADMIN_BOOTSTRAP_EMAILS`
- `NEXT_PUBLIC_APP_URL`

## Notes
- First admin can be bootstrapped via `ADMIN_BOOTSTRAP_EMAILS`.
- If `RESEND_API_KEY` is empty, OTP is logged to server console (dev fallback).
- Expo app is scaffolded for parity expansion in next phase.
