import type { Metadata } from 'next';

import { PasswordChangeForm } from '@/features/my/ui/PasswordChangeForm';

export const metadata: Metadata = { title: '비밀번호 변경' };
export const dynamic = 'force-dynamic';

export default function MyPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-ink-900">비밀번호 변경</h1>
      <PasswordChangeForm />
    </div>
  );
}
