import type { Metadata } from 'next';

import { AdminReports } from '@/features/admin/ui/AdminReports';

export const metadata: Metadata = { title: '신고 관리' };
export const dynamic = 'force-dynamic';

export default function AdminReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-ink-900">신고 관리</h1>
      <AdminReports />
    </div>
  );
}
