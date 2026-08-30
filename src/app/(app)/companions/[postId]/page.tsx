import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CompanionDetailView } from '@/features/companion/ui/CompanionDetailView';

export const metadata: Metadata = { title: '동행 구하기' };
export const dynamic = 'force-dynamic';

export default async function CompanionDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const id = Number(postId);

  if (!Number.isInteger(id) || id <= 0) notFound();

  return <CompanionDetailView postId={id} />;
}
