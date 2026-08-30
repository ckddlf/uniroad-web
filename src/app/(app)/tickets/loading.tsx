import { Skeleton } from '@/shared/ui';

export default function TicketsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-36 w-full" />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <li key={index}>
            <Skeleton className="h-44 w-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
