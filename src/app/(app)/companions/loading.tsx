import { Skeleton } from '@/shared/ui';

export default function CompanionsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-40 w-full" />

      <ul className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <li key={index}>
            <Skeleton className="h-52 w-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
