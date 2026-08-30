'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, Home } from 'lucide-react';

import { toErrorMessage } from '@/shared/api/errors';
import { Button, useToast } from '@/shared/ui';

import { useRefreshMember } from '../../model/useAuthActions';

/** 온보딩을 마친 뒤 회원 정보를 다시 받아 전역 상태를 갱신하고 이동한다 */
export function CompleteStep({ nickname }: { nickname: string }) {
  const router = useRouter();
  const toast = useToast();
  const refreshMember = useRefreshMember();
  const [movingTo, setMovingTo] = useState<string | null>(null);

  const go = async (target: string) => {
    setMovingTo(target);
    try {
      await refreshMember();
    } catch (error) {
      toast.error(toErrorMessage(error));
      setMovingTo(null);
      return;
    }
    router.replace(target);
  };

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-display">🎉</p>
      <h2 className="text-h1 text-ink-900">환영합니다, {nickname}님!</h2>
      <p className="mb-8 text-body text-ink-500">
        이제 커뮤니티를 둘러볼 수 있어요. 거래와 동행까지 쓰시려면 교환학생 인증이 필요해요.
      </p>

      <div className="grid w-full gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={movingTo !== null}
          onClick={() => void go('/verification')}
          className="flex flex-col items-start gap-2 rounded-lg border border-brand-500 bg-brand-50 p-5 text-left transition-colors hover:bg-brand-100 disabled:opacity-60"
        >
          <BadgeCheck aria-hidden className="size-6 text-brand-600" />
          <span className="text-body font-medium text-ink-900">교환학생 인증하기</span>
          <span className="text-caption text-ink-500">
            합격 통지서나 파견 확인서를 올리면 거래·동행을 쓸 수 있어요.
          </span>
          <span className="mt-1 inline-flex items-center gap-1 text-caption font-medium text-brand-700">
            바로 인증 <ArrowRight aria-hidden className="size-3.5" />
          </span>
        </button>

        <button
          type="button"
          disabled={movingTo !== null}
          onClick={() => void go('/home')}
          className="flex flex-col items-start gap-2 rounded-lg border border-ink-300 bg-surface p-5 text-left transition-colors hover:border-ink-500 disabled:opacity-60"
        >
          <Home aria-hidden className="size-6 text-ink-500" />
          <span className="text-body font-medium text-ink-900">홈으로 가기</span>
          <span className="text-caption text-ink-500">준비 일정과 커뮤니티를 먼저 둘러볼게요.</span>
        </button>
      </div>

      <Button
        variant="ghost"
        className="mt-4"
        loading={movingTo !== null}
        onClick={() => void go('/home')}
      >
        나중에 할게요
      </Button>
    </div>
  );
}
