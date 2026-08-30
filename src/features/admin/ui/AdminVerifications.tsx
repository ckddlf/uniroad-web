'use client';

import { useEffect, useState } from 'react';

import { toErrorMessage } from '@/shared/api/errors';
import type { VerificationStatus } from '@/shared/api/types';
import { cn } from '@/shared/lib/cn';
import { formatDateTime } from '@/shared/lib/date';
import { VERIFICATION_STATUS } from '@/shared/lib/constants';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Modal,
  Radio,
  RadioGroup,
  Skeleton,
  Tabs,
  Textarea,
  useToast,
} from '@/shared/ui';

import { useAdminVerifications, useReviewVerification } from '../api';
import { VerificationViewer } from './VerificationViewer';

const REJECT_PRESETS = [
  '이미지가 불명확함',
  '서류가 본인 것이 아님',
  '개인정보 미마스킹',
  '기타',
];

const TABS: { value: VerificationStatus; label: string }[] = [
  { value: 'PENDING', label: '대기' },
  { value: 'APPROVED', label: '승인' },
  { value: 'REJECTED', label: '거절' },
];

export function AdminVerifications() {
  const toast = useToast();
  const [status, setStatus] = useState<VerificationStatus>('PENDING');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [preset, setPreset] = useState(REJECT_PRESETS[0]);
  const [customReason, setCustomReason] = useState('');

  const list = useAdminVerifications(status);
  const { approve, reject } = useReviewVerification();

  const items = list.data ?? [];
  const selected = items[Math.min(selectedIndex, Math.max(0, items.length - 1))];

  useEffect(() => setSelectedIndex(0), [status]);

  const approveSelected = () => {
    if (!selected || status !== 'PENDING') return;

    approve.mutate(selected.verification.id, {
      onSuccess: () => toast.success(`${selected.memberName}님의 인증을 승인했어요.`),
      onError: (error) => toast.error(toErrorMessage(error)),
    });
  };

  const submitReject = () => {
    if (!selected) return;

    const reason = preset === '기타' ? customReason.trim() : preset;
    if (reason === '') {
      toast.error('거절 사유를 입력해주세요.');
      return;
    }

    reject.mutate(
      { id: selected.verification.id, reason },
      {
        onSuccess: () => {
          setRejectOpen(false);
          setCustomReason('');
          toast.success('거절 처리했어요.');
        },
        onError: (error) => toast.error(toErrorMessage(error)),
      },
    );
  };

  // 심사는 반복 작업이라 손이 키보드에서 떠나지 않게 한다
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable === true;

      if (typing || rejectOpen) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((index) => Math.min(items.length - 1, index + 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((index) => Math.max(0, index - 1));
      } else if (status === 'PENDING' && (event.key === 'a' || event.key === 'A')) {
        approveSelected();
      } else if (status === 'PENDING' && (event.key === 'r' || event.key === 'R')) {
        setRejectOpen(true);
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          aria-label="심사 상태"
          items={TABS.map((tab) => ({ value: tab.value, label: tab.label }))}
          value={status}
          onChange={(value) => setStatus(value as VerificationStatus)}
        />

        <p className="text-caption text-ink-500">
          단축키 · <kbd className="rounded border border-ink-300 px-1">A</kbd> 승인{' '}
          <kbd className="rounded border border-ink-300 px-1">R</kbd> 거절{' '}
          <kbd className="rounded border border-ink-300 px-1">↑↓</kbd> 이동
        </p>
      </div>

      {list.isPending && <Skeleton className="h-96 w-full" />}
      {list.isError && <ErrorState error={list.error} onRetry={() => void list.refetch()} />}

      {list.isSuccess &&
        (items.length === 0 ? (
          <EmptyState title={`${VERIFICATION_STATUS[status]} 상태인 제출이 없어요`} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
            <ul className="flex max-h-[36rem] flex-col overflow-y-auto rounded-lg border border-ink-100 bg-surface">
              {items.map((item, index) => (
                <li key={item.verification.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    aria-current={index === selectedIndex ? 'true' : undefined}
                    className={cn(
                      'flex w-full flex-col gap-1 border-b border-ink-100 px-4 py-3 text-left transition-colors',
                      index === selectedIndex ? 'bg-brand-50' : 'hover:bg-ink-100/60',
                    )}
                  >
                    <span className="text-body font-medium text-ink-900">{item.memberName}</span>
                    <span className="truncate text-caption text-ink-500">{item.memberEmail}</span>
                    <span className="text-caption text-ink-500">
                      {formatDateTime(item.verification.submittedAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {selected && (
              <section className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-h2 text-ink-900">{selected.memberName}</h2>
                    <p className="text-caption text-ink-500">{selected.memberEmail}</p>
                    <p className="mt-1 text-caption text-ink-500">
                      제출 {formatDateTime(selected.verification.submittedAt)}
                      {selected.verification.reviewedAt &&
                        ` · 검토 ${formatDateTime(selected.verification.reviewedAt)}`}
                    </p>
                  </div>

                  <Badge
                    tone={
                      selected.verification.status === 'APPROVED'
                        ? 'brand'
                        : selected.verification.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {VERIFICATION_STATUS[selected.verification.status]}
                  </Badge>
                </div>

                {selected.verification.rejectReason && (
                  <p className="rounded-md bg-danger-bg px-4 py-3 text-body text-danger">
                    거절 사유: {selected.verification.rejectReason}
                  </p>
                )}

                <VerificationViewer
                  imageUrl={selected.verification.imageUrl}
                  alt={`${selected.memberName} 제출 서류`}
                />

                {status === 'PENDING' && (
                  <div className="flex flex-wrap gap-2">
                    <Button loading={approve.isPending} onClick={approveSelected}>
                      승인 (A)
                    </Button>
                    <Button variant="danger" onClick={() => setRejectOpen(true)}>
                      거절 (R)
                    </Button>
                  </div>
                )}
              </section>
            )}
          </div>
        ))}

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="거절 사유를 선택해주세요"
        description="선택한 사유는 신청자에게 그대로 보입니다."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>
              취소
            </Button>
            <Button variant="danger" loading={reject.isPending} onClick={submitReject}>
              거절하기
            </Button>
          </>
        }
      >
        <RadioGroup legend="사유">
          {REJECT_PRESETS.map((value) => (
            <Radio
              key={value}
              name="reject-reason"
              value={value}
              checked={preset === value}
              onChange={() => setPreset(value)}
              label={value}
            />
          ))}
        </RadioGroup>

        {preset === '기타' && (
          <Textarea
            containerClassName="mt-4"
            label="직접 입력"
            maxLength={200}
            showCount
            value={customReason}
            onChange={(event) => setCustomReason(event.target.value)}
          />
        )}
      </Modal>
    </div>
  );
}
