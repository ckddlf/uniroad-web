import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { buttonClass } from '@/shared/ui/Button';

import { Section } from './Section';

export function FinalCta() {
  return (
    <Section tone="brand">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-section text-white text-balance">
          다음 학기 준비, 오늘 한 곳에서 시작하세요
        </h2>
        <p className="mt-5 max-w-xl text-lead text-brand-100">
          파견 준비 일정과 제출 서류부터 현지 거래와 동행까지. 가입하고 바로 둘러볼 수 있습니다.
        </p>

        <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/signup"
            className={buttonClass({
              size: 'lg',
              className:
                'w-full bg-surface text-brand-700 hover:bg-brand-50 active:bg-brand-100 sm:w-auto',
            })}
          >
            바로 시작하기
            <ArrowRight aria-hidden className="size-4" />
          </Link>
          <Link
            href="/login"
            className={buttonClass({
              variant: 'secondary',
              size: 'lg',
              className:
                'w-full border-white/35 bg-transparent text-white hover:bg-white/10 sm:w-auto',
            })}
          >
            로그인
          </Link>
        </div>
      </div>
    </Section>
  );
}
