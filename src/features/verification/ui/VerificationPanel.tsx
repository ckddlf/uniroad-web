'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, Clock, XCircle } from 'lucide-react';

import { useRefreshMember } from '@/features/auth/model/useAuthActions';
import type { VerificationResponse } from '@/shared/api/types';
import { formatDateTime } from '@/shared/lib/date';
import { Button, ErrorState, Skeleton } from '@/shared/ui';

import { useMyVerifications } from '../api';
import { VerificationBenefits } from './VerificationBenefits';
import { VerificationImage } from './VerificationImage';
import { VerificationUploadForm } from './VerificationUploadForm';

export function VerificationPanel() {
  const verifications = useMyVerifications();
  const refreshMember = useRefreshMember();

  // 승인되면 role이 VERIFIED로 바뀌므로 진입할 때와 창으로 돌아올 때 회원 정보를 다시 받는다
  useEffect(() => {
    const refresh = () => {
      void refreshMember().catch(() => undefined);
    };

    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [refreshMember]);

  if (verifications.isPending) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (verifications.isError) {
    return <ErrorState error={verifications.error} onRetry={() => void verifications.refetch()} />;
  }

  const latest = verifications.data[0] ?? null;

  return (
    <div className="flex flex-col gap-10">
      {latest === null && <IntroState />}
      {latest?.status === 'PENDING' && <PendingState verification={latest} />}
      {latest?.status === 'APPROVED' && <ApprovedState verification={latest} />}
      {latest?.status === 'REJECTED' && <RejectedState verification={latest} />}

      <VerificationBenefits />
    </div>
  );
}

function IntroState() {
  return (
    <section className="flex flex-col gap-5">
      <p className="text-body text-ink-700">
        파견이 확인된 회원만 중고거래·티켓 양도·동행 글을 올리고 채팅을 시작할 수 있어요. 서류를
        올려주시면 보통 1~2일 안에 확인해 드릴게요.
      </p>
      <VerificationUploadForm />
    </section>
  );
}

function PendingState({ verification }: { verification: VerificationResponse }) {
  return (
    <section className="flex flex-col gap-5 rounded-lg border border-ink-100 bg-surface p-6 shadow-card sm:flex-row">
      <div className="w-full sm:max-w-52">
        <VerificationImage imageUrl={verification.imageUrl} alt="제출한 인증 서류" />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <span className="inline-flex items-center gap-2 text-warning">
          <Clock aria-hidden className="size-5" />
          <span className="text-h2">검토 중이에요</span>
        </span>
        <p className="text-body text-ink-500">
          보통 1~2일 안에 확인해 드려요. 결과가 나오면 이 화면에서 알려드릴게요.
        </p>
        <p className="mt-2 text-caption text-ink-500">
          제출 {formatDateTime(verification.submittedAt)}
        </p>
      </div>
    </section>
  );
}

function ApprovedState({ verification }: { verification: VerificationResponse }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-brand-100 bg-brand-50 p-6">
      <span className="inline-flex items-center gap-2 text-brand-700">
        <BadgeCheck aria-hidden className="size-6" />
        <span className="text-h2">교환학생 인증이 완료됐어요</span>
      </span>

      <p className="text-body text-ink-700">
        이제 중고거래·티켓 양도·동행 글을 올리고 채팅을 시작할 수 있어요.
      </p>
      {verification.reviewedAt && (
        <p className="text-caption text-ink-500">승인 {formatDateTime(verification.reviewedAt)}</p>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          href="/market"
          className="inline-flex h-10 items-center rounded-md bg-brand-500 px-4 text-body font-medium text-white transition-colors hover:bg-brand-600"
        >
          중고거래 둘러보기
        </Link>
        <Link
          href="/companions"
          className="inline-flex h-10 items-center rounded-md border border-ink-300 bg-surface px-4 text-body font-medium text-ink-900 transition-colors hover:bg-ink-100"
        >
          동행 구하기
        </Link>
      </div>
    </section>
  );
}

function RejectedState({ verification }: { verification: VerificationResponse }) {
  const [retrying, setRetrying] = useState(false);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-lg border border-danger/20 bg-danger-bg p-6">
        <span className="inline-flex items-center gap-2 text-danger">
          <XCircle aria-hidden className="size-6" />
          <span className="text-h2">인증이 거절됐어요</span>
        </span>

        {verification.rejectReason ? (
          <div className="rounded-md bg-surface p-4">
            <p className="text-label font-medium text-ink-700">거절 사유</p>
            <p className="mt-1 text-body whitespace-pre-wrap text-ink-900">
              {verification.rejectReason}
            </p>
          </div>
        ) : (
          <p className="text-body text-ink-700">사유가 기록되지 않았어요. 서류를 다시 올려주세요.</p>
        )}

        {verification.reviewedAt && (
          <p className="text-caption text-ink-500">검토 {formatDateTime(verification.reviewedAt)}</p>
        )}

        {!retrying && (
          <Button className="mt-2 self-start" onClick={() => setRetrying(true)}>
            다시 제출하기
          </Button>
        )}
      </div>

      {retrying && <VerificationUploadForm submitLabel="다시 제출하기" />}
    </section>
  );
}
