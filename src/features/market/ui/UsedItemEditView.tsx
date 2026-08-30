'use client';

import Link from 'next/link';

import { useAuthStore } from '@/shared/store/authStore';
import { buttonClass, EmptyState, ErrorState, Skeleton } from '@/shared/ui';

import { useUsedItem } from '../api';
import { UsedItemForm } from './UsedItemForm';

/** 수정은 작성자 본인만 — 상세 DTO에 mine이 없어 memberId로 판단한다 */
export function UsedItemEditView({ itemId }: { itemId: number }) {
  const item = useUsedItem(itemId);
  const myId = useAuthStore((state) => state.member?.id);

  if (item.isPending) return <Skeleton className="h-96 w-full" />;
  if (item.isError) return <ErrorState error={item.error} onRetry={() => void item.refetch()} />;

  if (myId === undefined || item.data.memberId !== myId) {
    return (
      <EmptyState
        title="수정할 수 없는 글이에요"
        description="내가 올린 판매글만 수정할 수 있어요."
        action={
          <Link href={`/market/${itemId}`} className={buttonClass()}>
            판매글로 돌아가기
          </Link>
        }
      />
    );
  }

  return <UsedItemForm itemId={itemId} initial={item.data} />;
}
