'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { toErrorMessage } from '@/shared/api/errors';
import type { ReportResponse, ReportStatus, ReportTargetType } from '@/shared/api/types';
import { REPORT_REASON, REPORT_STATUS, REPORT_TARGET } from '@/shared/lib/constants';
import { formatDateTime } from '@/shared/lib/date';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Modal,
  Select,
  Skeleton,
  Textarea,
  useToast,
} from '@/shared/ui';

import { useAdminReports, useUpdateReport } from '../api';

const STATUSES: ReportStatus[] = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
const TARGETS: ReportTargetType[] = [
  'FREE_POST',
  'USED_ITEM',
  'TICKET_TRANSFER',
  'COMPANION',
  'MEMBER',
];

/** 신고 대상 원문으로 가는 링크 (회원 신고는 대응 화면이 없다) */
function targetHref(report: ReportResponse): string | null {
  switch (report.targetType) {
    case 'FREE_POST':
      return `/community/${report.targetId}`;
    case 'USED_ITEM':
      return `/market/${report.targetId}`;
    case 'TICKET_TRANSFER':
      return `/tickets/${report.targetId}`;
    case 'COMPANION':
      return `/companions/${report.targetId}`;
    default:
      return null;
  }
}

export function AdminReports() {
  const toast = useToast();
  const reports = useAdminReports();
  const updateReport = useUpdateReport();

  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [targetFilter, setTargetFilter] = useState<ReportTargetType | ''>('');
  const [editing, setEditing] = useState<ReportResponse | null>(null);
  const [nextStatus, setNextStatus] = useState<ReportStatus>('IN_PROGRESS');
  const [memo, setMemo] = useState('');

  const filtered = useMemo(
    () =>
      (reports.data ?? []).filter((report) => {
        if (statusFilter && report.status !== statusFilter) return false;
        if (targetFilter && report.targetType !== targetFilter) return false;
        return true;
      }),
    [reports.data, statusFilter, targetFilter],
  );

  const openEditor = (report: ReportResponse) => {
    setEditing(report);
    setNextStatus(report.status);
    setMemo(report.adminMemo ?? '');
  };

  const save = () => {
    if (!editing) return;

    updateReport.mutate(
      {
        id: editing.id,
        status: nextStatus,
        ...(memo.trim() ? { adminMemo: memo.trim() } : {}),
      },
      {
        onSuccess: () => {
          setEditing(null);
          toast.success('신고 상태를 변경했어요.');
        },
        onError: (error) => toast.error(toErrorMessage(error)),
      },
    );
  };

  if (reports.isPending) return <Skeleton className="h-96 w-full" />;
  if (reports.isError) {
    return <ErrorState error={reports.error} onRetry={() => void reports.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Select
          aria-label="처리 상태"
          placeholder="전체 상태"
          containerClassName="w-40"
          options={STATUSES.map((status) => ({ value: status, label: REPORT_STATUS[status] }))}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as ReportStatus | '')}
        />

        <Select
          aria-label="대상 종류"
          placeholder="전체 대상"
          containerClassName="w-44"
          options={TARGETS.map((target) => ({ value: target, label: REPORT_TARGET[target] }))}
          value={targetFilter}
          onChange={(event) => setTargetFilter(event.target.value as ReportTargetType | '')}
        />
      </div>

      <p className="text-caption text-ink-500">전체 {filtered.length}건</p>

      {filtered.length === 0 ? (
        <EmptyState title="조건에 맞는 신고가 없어요" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ink-100 bg-surface">
          <table className="w-full min-w-[820px] border-collapse text-body">
            <thead>
              <tr className="border-b border-ink-100 text-left text-caption text-ink-500">
                <th scope="col" className="px-4 py-3 font-medium">대상</th>
                <th scope="col" className="px-4 py-3 font-medium">사유</th>
                <th scope="col" className="px-4 py-3 font-medium">신고자</th>
                <th scope="col" className="px-4 py-3 font-medium">접수</th>
                <th scope="col" className="px-4 py-3 font-medium">상태</th>
                <th scope="col" className="px-4 py-3 font-medium">처리</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((report) => {
                const href = targetHref(report);

                return (
                  <tr key={report.id} className="border-b border-ink-100 last:border-b-0">
                    <td className="px-4 py-3">
                      <span className="text-ink-900">{REPORT_TARGET[report.targetType]}</span>
                      {href ? (
                        <Link
                          href={href}
                          className="ml-2 text-caption text-brand-600 hover:underline"
                        >
                          원문 보기
                        </Link>
                      ) : (
                        <span className="ml-2 text-caption text-ink-500">#{report.targetId}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-ink-700">{REPORT_REASON[report.reason]}</span>
                      {report.detail && (
                        <span className="ml-2 text-caption text-ink-500">{report.detail}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-500">{report.reporterName}</td>
                    <td className="px-4 py-3 text-caption text-ink-500">
                      {formatDateTime(report.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          report.status === 'RESOLVED'
                            ? 'brand'
                            : report.status === 'REJECTED'
                              ? 'neutral'
                              : report.status === 'IN_PROGRESS'
                                ? 'info'
                                : 'warning'
                        }
                      >
                        {REPORT_STATUS[report.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="secondary" onClick={() => openEditor(report)}>
                        상태 변경
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="신고 처리"
        description="상태 변경은 되돌릴 수 없습니다."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              취소
            </Button>
            <Button loading={updateReport.isPending} onClick={save}>
              저장
            </Button>
          </>
        }
      >
        <Select
          label="처리 상태"
          options={STATUSES.map((status) => ({ value: status, label: REPORT_STATUS[status] }))}
          value={nextStatus}
          onChange={(event) => setNextStatus(event.target.value as ReportStatus)}
        />

        <Textarea
          containerClassName="mt-4"
          label="관리자 메모"
          placeholder="어떤 조치를 했는지 남겨주세요."
          maxLength={500}
          showCount
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
        />
      </Modal>
    </div>
  );
}
