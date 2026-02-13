# Car Pool PG2 Web App

This Next.js app is standalone-deployable.

## Deploy on Vercel
1. Import this `apps/web` folder as a Vercel project (or set root directory to `apps/web`).
2. Vercel config is already included in `vercel.json`.
3. Add environment variables:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `GOOGLE_CLIENT_ID`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `ADMIN_BOOTSTRAP_EMAILS`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy.

`vercel-build` automatically runs Prisma generate + schema push + seed before building.

## Local Run
```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```
