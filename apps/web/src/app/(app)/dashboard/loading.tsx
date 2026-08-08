import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="surface-raised rounded-2xl p-5">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="mt-3 h-8 w-3/4" />
        <Skeleton className="mt-2 h-4 w-full" />
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-[104px] rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="surface-card rounded-2xl p-5">
        <Skeleton className="h-5 w-32" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-[88px] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
