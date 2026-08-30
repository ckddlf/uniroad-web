import { Skeleton } from '@/shared/ui';

export default function MarketLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-32 w-full" />

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
          <li key={index}>
            <Skeleton className="aspect-square w-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
