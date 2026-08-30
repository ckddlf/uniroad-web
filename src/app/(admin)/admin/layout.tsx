import type { ReactNode } from 'react';

import { AuthGuard } from '@/features/auth/ui/AuthGuard';
import { AdminShell } from '@/widgets/admin/AdminShell';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard require="ACTIVE" role="ADMIN">
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}
