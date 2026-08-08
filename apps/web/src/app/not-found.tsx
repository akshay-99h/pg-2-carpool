import { Compass, Home } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))]">
      <div className="surface-raised w-full max-w-sm rounded-2xl p-6 text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Compass className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-4 font-heading text-xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page has moved or never existed. Head back to your dashboard to keep going.
        </p>
        <Button asChild className="mt-5 w-full">
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" aria-hidden />
            Back to dashboard
          </Link>
        </Button>
      </div>
    </main>
  );
}
