'use client';

import { useState, type MouseEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { selectIsVerified, useAuthStore } from '@/shared/store/authStore';

import { Button } from './Button';
import { Modal } from './Modal';

export interface VerifiedGateProps {
  /** 인증이 필요한 동작을 실행하는 버튼·링크 */
  children: ReactNode;
  /** 자물쇠 표시를 끄고 싶을 때 */
  showLock?: boolean;
  className?: string;
}

/**
 * 거래·동행·채팅 개설처럼 VERIFIED가 필요한 동작을 감싼다.
 *
 * 버튼을 숨기지 않고 잠그는 이유는, 숨기면 인증할 이유가 보이지 않기 때문이다.
 * 인증 전 회원이 누르면 클릭을 가로채 안내 모달을 띄운다.
 */
export function VerifiedGate({ children, showLock = true, className }: VerifiedGateProps) {
  const router = useRouter();
  const verified = useAuthStore(selectIsVerified);
  const [open, setOpen] = useState(false);

  if (verified) return <>{children}</>;

  const intercept = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <span
        onClickCapture={intercept}
        className={cn('relative inline-flex [&_*]:cursor-pointer', className)}
      >
        {children}
        {showLock && (
          <span
            aria-hidden
            className="pointer-events-none absolute -top-1.5 -right-1.5 inline-flex size-5 items-center justify-center rounded-full bg-ink-700 text-white"
          >
            <Lock className="size-3" />
          </span>
        )}
      </span>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="🔒 교환학생 인증이 필요해요"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              나중에 하기
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                router.push('/verification');
              }}
            >
              인증하러 가기 →
            </Button>
          </>
        }
      >
        <p className="text-body text-ink-700">
          거래·동행 기능은 파견이 확인된 회원만 이용할 수 있어요.
        </p>
        <p className="mt-2 text-body text-ink-500">사기 피해를 막기 위한 조치입니다.</p>
      </Modal>
    </>
  );
}
