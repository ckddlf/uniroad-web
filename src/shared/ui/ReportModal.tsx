'use client';

import { useState } from 'react';

import { toErrorMessage } from '@/shared/api/errors';
import type { ReportReason, ReportTargetType } from '@/shared/api/types';
import { REPORT_REASON } from '@/shared/lib/constants';
import { useCreateReport } from '@/features/report/api';

import { Button } from './Button';
import { Modal } from './Modal';
import { Radio, RadioGroup } from './Radio';
import { Textarea } from './Textarea';
import { useToast } from './Toast';

const REASONS: ReportReason[] = ['SPAM', 'ABUSE', 'FRAUD', 'INAPPROPRIATE', 'ETC'];

export interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: number;
}

export function ReportModal({ open, onClose, targetType, targetId }: ReportModalProps) {
  const toast = useToast();
  const report = useCreateReport();

  const [reason, setReason] = useState<ReportReason>('SPAM');
  const [detail, setDetail] = useState('');

  const close = () => {
    setReason('SPAM');
    setDetail('');
    onClose();
  };

  const submit = async () => {
    try {
      await report.mutateAsync({
        targetType,
        targetId,
        reason,
        ...(detail.trim() === '' ? {} : { detail: detail.trim() }),
      });
      toast.success('신고가 접수됐어요. 확인 후 조치할게요.');
      close();
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="신고하기"
      description="접수된 내용은 운영진만 확인합니다."
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            취소
          </Button>
          <Button variant="danger" loading={report.isPending} onClick={() => void submit()}>
            신고 접수
          </Button>
        </>
      }
    >
      <RadioGroup legend="신고 사유">
        {REASONS.map((value) => (
          <Radio
            key={value}
            name="report-reason"
            value={value}
            checked={reason === value}
            onChange={() => setReason(value)}
            label={REPORT_REASON[value]}
          />
        ))}
      </RadioGroup>

      <Textarea
        containerClassName="mt-5"
        label="상세 내용"
        placeholder="어떤 점이 문제였는지 적어주시면 확인에 도움이 돼요."
        maxLength={500}
        showCount
        value={detail}
        onChange={(event) => setDetail(event.target.value)}
      />
    </Modal>
  );
}
