import { Skeleton } from '@/shared/ui';

export default function AccountBookLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-9 w-28" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
