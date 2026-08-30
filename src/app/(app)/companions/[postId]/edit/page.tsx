import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CompanionEditView } from '@/features/companion/ui/CompanionEditView';

export const metadata: Metadata = { title: '동행 수정' };
export const dynamic = 'force-dynamic';

export default async function CompanionEditPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const id = Number(postId);

  if (!Number.isInteger(id) || id <= 0) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-h1 text-ink-900">동행 수정</h1>
      <CompanionEditView postId={id} />
    </div>
  );
}
