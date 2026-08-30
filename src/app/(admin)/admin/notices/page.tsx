import type { Metadata } from 'next';

import { AdminNotices } from '@/features/admin/ui/AdminNotices';

export const metadata: Metadata = { title: '공지 관리' };
export const dynamic = 'force-dynamic';

export default function AdminNoticesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-ink-900">공지 관리</h1>
      <AdminNotices />
    </div>
  );
}
