import { Skeleton } from '@/shared/ui';

export default function ScheduleLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
