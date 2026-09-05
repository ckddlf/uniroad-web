import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { buttonClass } from '@/shared/ui/Button';
import { Logo } from '@/shared/ui/Logo';

export function Hero() {
  return (
    <section className="landing-hero-tint bg-surface">
      <div className="mx-auto w-full max-w-[1200px] px-6 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-3.5 py-1.5 text-label text-brand-700">
            교환학생을 위한 커뮤니티
          </p>

          <h1 className="mt-6 text-hero text-ink-900 text-balance">
            교환학생 준비부터 현지 생활까지,
            <br />
            {/* 워드마크 높이를 글자 크기에 매달아, 제목이 줄어들 때 로고도 같이 줄어들게 한다 */}
            <Logo tone="ink" priority className="inline-block h-[0.78em] align-baseline" /> 하나로
          </h1>

          <p className="mt-6 max-w-xl text-lead text-ink-500 text-balance">
            교환학생에게 필요한 정보부터 거래, 네트워크까지 한곳에서 만나보세요.
          </p>

          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/signup"
              className={buttonClass({ size: 'lg', className: 'w-full sm:w-auto' })}
            >
              바로 시작하기
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link
              href="/login"
              className={buttonClass({
                variant: 'secondary',
                size: 'lg',
                className: 'w-full sm:w-auto',
              })}
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
