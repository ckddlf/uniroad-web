import type { Metadata } from 'next';

import { AdminDashboard } from '@/features/admin/ui/AdminDashboard';

export const metadata: Metadata = { title: '관리자 대시보드' };
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-ink-900">대시보드</h1>
      <AdminDashboard />
    </div>
  );
}
