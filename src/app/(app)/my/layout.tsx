import type { ReactNode } from 'react';

import { MySideNav } from '@/features/my/ui/MySideNav';

export default function MyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
      <MySideNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
