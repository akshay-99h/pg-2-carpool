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
   - `CONTACT_CAPTCHA_PHRASE`
4. Recommended production values for your setup:
   - `EMAIL_FROM=Car Pool Panchsheel Greens 2 <car_admin@akxost.com>`
   - `ADMIN_BOOTSTRAP_EMAILS=car_admin@akxost.com`
   - `NEXT_PUBLIC_APP_URL=https://carpool.akxost.com`
5. Add `carpool.akxost.com` in Vercel Domains for this project.
6. Deploy.

`vercel-build` runs Prisma generate + migration deploy before building.
Run seed manually only when needed (`pnpm db:seed`).

If your production database already existed before Prisma migrations were added,
run this one-time baseline command before the next deploy:

```bash
DATABASE_URL="<production_database_url>" pnpm --filter @carpool/web exec prisma migrate resolve --applied 20260217202000_baseline
```

## Local Run
```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```
