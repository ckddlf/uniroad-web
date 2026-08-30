import { Skeleton } from '@/shared/ui';

export default function CommunityLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-32" />

      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>

      <Skeleton className="h-10 w-full" />

      <div className="flex flex-col gap-4">
        {[0, 1, 2, 3, 4].map((index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}
