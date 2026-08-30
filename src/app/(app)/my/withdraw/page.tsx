import type { Metadata } from 'next';

import { WithdrawForm } from '@/features/my/ui/WithdrawForm';

export const metadata: Metadata = { title: '회원 탈퇴' };
export const dynamic = 'force-dynamic';

export default function MyWithdrawPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-ink-900">회원 탈퇴</h1>
      <WithdrawForm />
    </div>
  );
}
