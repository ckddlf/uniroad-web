import type { ReactNode } from 'react';

import { AuthGuard } from '@/features/auth/ui/AuthGuard';
import { AppShell } from '@/widgets/shell/AppShell';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard require="ACTIVE">
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
