import type { Metadata } from 'next';

import { AdminVerifications } from '@/features/admin/ui/AdminVerifications';

export const metadata: Metadata = { title: '인증 심사' };
export const dynamic = 'force-dynamic';

export default function AdminVerificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-ink-900">인증 심사</h1>
      <AdminVerifications />
    </div>
  );
}
