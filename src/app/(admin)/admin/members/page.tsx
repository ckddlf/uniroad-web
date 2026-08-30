import type { Metadata } from 'next';

import { AdminMembers } from '@/features/admin/ui/AdminMembers';

export const metadata: Metadata = { title: '회원 관리' };
export const dynamic = 'force-dynamic';

export default function AdminMembersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-ink-900">회원 관리</h1>
      <AdminMembers />
    </div>
  );
}
