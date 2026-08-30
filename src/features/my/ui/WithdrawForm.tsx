'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';

import { useDeleteAccount } from '@/features/member/api';
import { toErrorMessage } from '@/shared/api/errors';
import { displayName } from '@/shared/lib/format';
import { useAuthStore } from '@/shared/store/authStore';
import { Button, Input, Modal, Radio, RadioGroup, useToast } from '@/shared/ui';

const REASONS = [
  '파견이 끝나서 더 이상 필요하지 않아요',
  '원하는 정보를 찾지 못했어요',
  '이용이 불편했어요',
  '개인정보가 걱정돼요',
  '기타',
];

const DELETED_DATA = [
  '작성한 게시글과 댓글',
  '등록한 중고거래·티켓·동행 글',
  '스크랩과 좋아요 기록',
  '가계부 내역과 잔액',
  '채팅방과 주고받은 메시지',
  '교환학생 인증 기록',
];

export function WithdrawForm() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const member = useAuthStore((state) => state.member);
  const clear = useAuthStore((state) => state.clear);
  const deleteAccount = useDeleteAccount();

  const [reason, setReason] = useState(REASONS[0]);
  const [confirmName, setConfirmName] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const expectedName = displayName(member?.nickname, member?.name);
  const nameMatches = confirmName.trim() === expectedName;

  const withdraw = async () => {
    try {
      await deleteAccount.mutateAsync();
      clear();
      queryClient.clear();
      toast.success('탈퇴 처리했어요. 그동안 이용해주셔서 고맙습니다.');
      router.replace('/');
    } catch (error) {
      setConfirmOpen(false);
      toast.error(toErrorMessage(error));
    }
  };

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="flex gap-3 rounded-md border border-danger/20 bg-danger-bg p-5">
        <AlertTriangle aria-hidden className="size-5 shrink-0 text-danger" />
        <div>
          <p className="text-body font-medium text-danger">탈퇴하면 되돌릴 수 없어요</p>
          <ul className="mt-2 flex flex-col gap-1">
            {DELETED_DATA.map((item) => (
              <li key={item} className="text-caption text-ink-700">
                · {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <RadioGroup legend="떠나시는 이유를 알려주세요">
        {REASONS.map((value) => (
          <Radio
            key={value}
            name="withdraw-reason"
            value={value}
            checked={reason === value}
            onChange={() => setReason(value)}
            label={value}
          />
        ))}
      </RadioGroup>
      {/* TODO(api): 탈퇴 사유를 저장할 필드가 요청에 없어 화면에서만 수집한다 */}

      <Input
        label="확인을 위해 닉네임을 입력해주세요"
        placeholder={expectedName}
        hint={`정확히 "${expectedName}" 을 입력해야 탈퇴할 수 있어요.`}
        value={confirmName}
        onChange={(event) => setConfirmName(event.target.value)}
      />

      <div className="flex justify-end">
        <Button variant="danger" disabled={!nameMatches} onClick={() => setConfirmOpen(true)}>
          회원 탈퇴
        </Button>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="정말 탈퇴할까요?"
        description="계정과 위에 적힌 데이터가 모두 삭제되며 복구할 수 없습니다."
        size="sm"
        dismissOnBackdrop={false}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              취소
            </Button>
            <Button variant="danger" loading={deleteAccount.isPending} onClick={() => void withdraw()}>
              탈퇴하기
            </Button>
          </>
        }
      />
    </div>
  );
}
