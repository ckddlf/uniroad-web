'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, CalendarDays, ChevronLeft, MapPin, MessageCircle, Siren, Users } from 'lucide-react';

import { isKakaoOpenChatLink, participantRatio, tripLength } from '@/entities/companion/trip';
import { isApiError, toErrorMessage } from '@/shared/api/errors';
import { COMPANION_STATUS } from '@/shared/lib/constants';
import { formatDate, formatDateTime } from '@/shared/lib/date';
import { formatNumber } from '@/shared/lib/format';
import { useAuthStore } from '@/shared/store/authStore';
import {
  Badge,
  Button,
  buttonClass,
  EmptyState,
  ErrorState,
  Modal,
  ProgressBar,
  ReportModal,
  Skeleton,
  useToast,
} from '@/shared/ui';

import {
  useCompanion,
  useCompleteCompanion,
  useDeleteCompanion,
  useToggleCompanionScrap,
} from '../api';


export function CompanionDetailView({ postId }: { postId: number }) {
  const router = useRouter();
  const toast = useToast();
  const myId = useAuthStore((state) => state.member?.id);

  const post = useCompanion(postId);
  const toggleScrap = useToggleCompanionScrap(postId);
  const complete = useCompleteCompanion(postId);
  const deletePost = useDeleteCompanion();

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);


  if (post.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (post.isError) {
    if (isApiError(post.error) && post.error.status === 404) {
      return (
        <EmptyState
          title="삭제됐거나 없는 모집글이에요"
          action={
            <Link href="/companions" className={buttonClass()}>
              동행 구하기로
            </Link>
          }
        />
      );
    }
    return <ErrorState error={post.error} onRetry={() => void post.refetch()} />;
  }

  const data = post.data;
  const recruiting = data.status === 'RECRUITING';
  const days = tripLength(data.startDate, data.endDate);
  const linkUsable = recruiting && isKakaoOpenChatLink(data.chatLink);

  const mine = myId !== undefined && data.memberId === myId;

  const finish = async () => {
    try {
      await complete.mutateAsync();
      toast.success('모집을 마감했어요.');
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const remove = async () => {
    try {
      await deletePost.mutateAsync(postId);
      toast.success('삭제했어요.');
      router.replace('/companions');
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <Link
        href="/companions"
        className="inline-flex items-center gap-1 self-start text-caption text-ink-500 hover:text-ink-900"
      >
        <ChevronLeft aria-hidden className="size-4" />
        동행 구하기
      </Link>

      <header className="flex flex-col gap-3">
        <Badge tone={recruiting ? 'brand' : 'neutral'}>
          {COMPANION_STATUS[data.status] ?? data.statusDescription}
        </Badge>
        <h1 className="text-h1 text-ink-900">{data.title}</h1>
        <p className="text-caption text-ink-500">
          {data.memberName} · {formatDateTime(data.createdAt)}
        </p>
      </header>

      <section className="grid gap-4 rounded-lg border border-ink-100 bg-surface p-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <p className="inline-flex items-center gap-1.5 text-caption text-ink-500">
            <CalendarDays aria-hidden className="size-3.5" />
            일정
          </p>
          <p className="text-body text-ink-900">
            {formatDate(data.startDate)} ~ {formatDate(data.endDate)}
            {days !== null && <span className="ml-1 text-ink-500">({days}일)</span>}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="inline-flex items-center gap-1.5 text-caption text-ink-500">
            <MapPin aria-hidden className="size-3.5" />
            장소
          </p>
          <p className="text-body text-ink-900">
            {[data.country, data.region].filter(Boolean).join(' ')}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <p className="inline-flex items-center gap-1.5 text-caption text-ink-500">
            <Users aria-hidden className="size-3.5" />
            정원
          </p>
          <p className="text-body text-ink-900">
            {data.currentParticipants}/{data.capacity}명
            {data.genderRatio && <span className="ml-1 text-ink-500">· 성비 {data.genderRatio}</span>}
          </p>
          <ProgressBar value={participantRatio(data)} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2 text-ink-900">소개</h2>
        <p className="text-body whitespace-pre-wrap text-ink-700">{data.content}</p>
      </section>

      <div className="flex flex-col gap-3 border-y border-ink-100 py-5">
        {recruiting ? (
          <Button
            size="lg"
            disabled={!linkUsable}
            onClick={() => setLeaveOpen(true)}
            leftIcon={<MessageCircle aria-hidden className="size-4" />}
          >
            카카오톡 오픈채팅으로 참여하기
          </Button>
        ) : (
          <div className="rounded-md bg-ink-100 px-4 py-3 text-center text-body text-ink-500">
            모집이 마감되었어요
          </div>
        )}

        {recruiting && !linkUsable && (
          <p className="text-caption text-ink-500">
            등록된 링크가 카카오톡 오픈채팅 주소가 아니어서 연결하지 않았어요.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
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
      </div>

      {mine && (
        <div className="flex flex-col gap-2 rounded-md border border-ink-100 bg-canvas p-4">
          <p className="text-label font-medium text-ink-700">내 모집글 관리</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/companions/${postId}/edit`}
              className={buttonClass({ variant: 'secondary', size: 'sm' })}
            >
              수정
            </Link>
            {recruiting && (
              <Button
                size="sm"
                variant="secondary"
                loading={complete.isPending}
                onClick={() => void finish()}
              >
                모집완료
              </Button>
            )}
            <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
              삭제
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title="외부 오픈채팅방으로 이동합니다"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setLeaveOpen(false)}>
              취소
            </Button>
            <a
              href={data.chatLink}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass()}
              onClick={() => setLeaveOpen(false)}
            >
              이동하기
            </a>
          </>
        }
      >
        <p className="text-body text-ink-700">
          UIROAD는 외부 채팅에서 발생한 문제에 책임지지 않습니다.
        </p>
        <p className="mt-2 text-body text-danger">선입금·송금을 요구하면 즉시 신고해주세요.</p>
      </Modal>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="COMPANION"
        targetId={postId}
      />

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="모집글을 삭제할까요?"
        description="삭제하면 되돌릴 수 없어요."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              취소
            </Button>
            <Button variant="danger" loading={deletePost.isPending} onClick={() => void remove()}>
              삭제
            </Button>
          </>
        }
      />
    </article>
  );
}
