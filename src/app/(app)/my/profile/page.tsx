import type { Metadata } from 'next';

import { ProfileEditForm } from '@/features/my/ui/ProfileEditForm';

export const metadata: Metadata = { title: '프로필 수정' };
export const dynamic = 'force-dynamic';

export default function MyProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-ink-900">프로필 수정</h1>
      <ProfileEditForm />
    </div>
  );
}
