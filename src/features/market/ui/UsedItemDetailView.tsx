'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, ChevronLeft, MessageSquare, Siren } from 'lucide-react';

import { useCreateChatRoom } from '@/features/chat/api';
import { AuthorChip } from '@/entities/trade/AuthorChip';
import { isApiError, toErrorMessage } from '@/shared/api/errors';
import type { TradeCategory } from '@/shared/api/types';
import { formatDateTime } from '@/shared/lib/date';
import { formatNumber } from '@/shared/lib/format';
import { TRADE_CATEGORY, TRADE_CATEGORY_ORDER, USED_ITEM_STATUS } from '@/shared/lib/constants';
import { useAuthStore } from '@/shared/store/authStore';
import {
  Badge,
  Button,
  buttonClass,
  EmptyState,
  ErrorState,
  Modal,
  ReportModal,
  Skeleton,
  useToast,
  VerifiedGate,
} from '@/shared/ui';

import {
  useDeleteUsedItem,
  useToggleUsedItemScrap,
  useUsedItem,
  useUsedItemStatusChange,
} from '../api';
import { CATEGORY_EMOJI } from './TradeItemsField';
import { UsedItemGallery } from './UsedItemGallery';

export function UsedItemDetailView({ itemId }: { itemId: number }) {
  const router = useRouter();
  const toast = useToast();
  const myId = useAuthStore((state) => state.member?.id);

  const item = useUsedItem(itemId);
  const toggleScrap = useToggleUsedItemScrap(itemId);
  const changeStatus = useUsedItemStatusChange(itemId);
  const deleteItem = useDeleteUsedItem();
  const createRoom = useCreateChatRoom();

  const [reportOpen, setReportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (item.isPending) {
    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (item.isError) {
    if (isApiError(item.error) && item.error.status === 404) {
      return (
        <EmptyState
          title="삭제됐거나 없는 판매글이에요"
          action={
            <Link href="/market" className={buttonClass()}>
              중고거래로
            </Link>
          }
        />
      );
    }
    return <ErrorState error={item.error} onRetry={() => void item.refetch()} />;
  }

  const data = item.data;
  const mine = myId !== undefined && data.memberId === myId;
  const sold = data.status === 'SOLD';
  const place = [data.country, data.region].filter(Boolean).join(' ');

  const grouped = TRADE_CATEGORY_ORDER.map((category) => ({
    category,
    items: (data.items ?? []).filter((entry) => entry.category === category),
  })).filter((group) => group.items.length > 0);

  const startChat = async () => {
    try {
      const room = await createRoom.mutateAsync({
        referenceType: 'TRADE',
        referenceId: itemId,
        targetMemberId: data.memberId,
      });
      router.push(`/chat/${room.roomId}`);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const changeTo = async (next: 'complete' | 'reopen') => {
    try {
      await changeStatus.mutateAsync(next);
      toast.success(next === 'complete' ? '판매완료로 바꿨어요.' : '다시 판매중으로 바꿨어요.');
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const remove = async () => {
    try {
      await deleteItem.mutateAsync(itemId);
      toast.success('삭제했어요.');
      router.replace('/market');
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  return (
    <article className="flex flex-col gap-8">
      <Link
        href="/market"
        className="inline-flex items-center gap-1 self-start text-caption text-ink-500 hover:text-ink-900"
      >
        <ChevronLeft aria-hidden className="size-4" />
        중고거래
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <UsedItemGallery
          thumbnailImageUrl={data.thumbnailImageUrl}
          categoryImages={data.categoryImages ?? []}
          title={data.title}
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {place && <Badge tone="brand">{place}</Badge>}
            {data.semester && <Badge>{data.semester}</Badge>}
            {/* 아직 status를 내려주지 않는 서버 버전에서는 뱃지를 생략한다 */}
            {data.status && (
              <Badge tone={sold ? 'neutral' : 'brand'}>{USED_ITEM_STATUS[data.status]}</Badge>
            )}
          </div>

          <h1 className="text-h1 text-ink-900">{data.title}</h1>
          <p className="text-display text-ink-900">{formatNumber(data.price)}</p>

          <div className="border-y border-ink-100 py-4">
            <AuthorChip author={data} withAvatar />
          </div>

          <p className="text-caption text-ink-500">{formatDateTime(data.createdAt)} 등록</p>

          <div className="flex flex-wrap gap-2">
            {!mine && (
              <VerifiedGate>
                <Button
                  loading={createRoom.isPending}
                  onClick={() => void startChat()}
                  leftIcon={<MessageSquare aria-hidden className="size-4" />}
                >
                  채팅하기
                </Button>
              </VerifiedGate>
            )}

            <Button
              variant="secondary"
              loading={toggleScrap.isPending}
              onClick={() => toggleScrap.mutate()}
              leftIcon={<Bookmark aria-hidden className="size-4" />}
            >
              스크랩 {formatNumber(data.scrapCount)}
            </Button>

            {!mine && (
              <Button
                variant="ghost"
                onClick={() => setReportOpen(true)}
                leftIcon={<Siren aria-hidden className="size-4" />}
              >
                신고
              </Button>
            )}
          </div>

          {mine && (
            <div className="flex flex-col gap-2 rounded-md border border-ink-100 bg-canvas p-4">
              <p className="text-label font-medium text-ink-700">내 판매글 관리</p>
              <div className="flex flex-wrap gap-2">
                <Link href={`/market/${itemId}/edit`} className={buttonClass({ variant: 'secondary', size: 'sm' })}>
                  수정
                </Link>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={changeStatus.isPending}
                  onClick={() => void changeTo(sold ? 'reopen' : 'complete')}
                >
                  {sold ? '판매중으로 되돌리기' : '판매완료로 변경'}
                </Button>
                <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
                  삭제
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2 text-ink-900">설명</h2>
        <p className="text-body whitespace-pre-wrap text-ink-700">{data.content}</p>
      </section>

      {grouped.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-h2 text-ink-900">포함 품목</h2>

          <div className="overflow-hidden rounded-lg border border-ink-100">
            {grouped.map((group) => (
              <details key={group.category} open className="border-b border-ink-100 last:border-b-0">
                <summary className="cursor-pointer bg-canvas px-4 py-3 text-label font-medium text-ink-700">
                  {CATEGORY_EMOJI[group.category as TradeCategory]}{' '}
                  {TRADE_CATEGORY[group.category as TradeCategory]} ({group.items.length})
                </summary>

                <ul className="divide-y divide-ink-100">
                  {group.items.map((entry) => (
                    <li
                      key={`${entry.category}-${entry.name}`}
                      className="flex items-center justify-between px-4 py-2.5 text-body"
                    >
                      <span className="text-ink-900">{entry.name}</span>
                      <span className="text-ink-500">{entry.quantity}개</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>
      )}

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="USED_ITEM"
        targetId={itemId}
      />

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="판매글을 삭제할까요?"
        description="삭제하면 되돌릴 수 없어요."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              취소
            </Button>
            <Button variant="danger" loading={deleteItem.isPending} onClick={() => void remove()}>
              삭제
            </Button>
          </>
        }
      />
    </article>
  );
}
