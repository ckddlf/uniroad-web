import { Skeleton } from '@/shared/ui';

export default function NotificationsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-10 w-full" />
      {[0, 1, 2, 3].map((index) => (
        <Skeleton key={index} className="h-20 w-full" />
      ))}
    </div>
  );
}
