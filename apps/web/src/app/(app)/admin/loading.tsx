import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="surface-raised rounded-2xl p-5">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="mt-3 h-7 w-2/3" />
      </div>
      <div className="surface-card space-y-3 rounded-2xl p-5">
        {[0, 1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-14 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
