import { Skeleton } from '@/shared/ui';

export default function HomeLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-28 w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}
