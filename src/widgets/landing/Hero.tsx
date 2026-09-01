import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, MessagesSquare, ShoppingBag } from 'lucide-react';

import { buttonClass } from '@/shared/ui/Button';
import { ProgressBar } from '@/shared/ui/ProgressBar';

import { MockPanel, MockRow } from './MockUi';

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
            UNIROAD 하나로
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

          <p className="mt-4 text-caption text-ink-500">
            아이디와 비밀번호만 있으면 됩니다.
          </p>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

/** 히어로 아래에 놓이는 홈 화면 미리보기 도식 */
function HeroPreview() {
  return (
    <div className="mt-16 sm:mt-20">
      <div className="mx-auto max-w-[980px] overflow-hidden rounded-lg border border-ink-100 bg-canvas shadow-pop">
        <div className="flex items-center gap-1.5 border-b border-ink-100 bg-surface px-4 py-3">
          <span aria-hidden className="size-2.5 rounded-full bg-ink-100" />
          <span aria-hidden className="size-2.5 rounded-full bg-ink-100" />
          <span aria-hidden className="size-2.5 rounded-full bg-ink-100" />
          <p className="ml-2 text-caption text-ink-500">UNIROAD · 홈</p>
        </div>

        <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2">
          <div className="rounded-lg border border-ink-100 bg-surface p-5 shadow-card md:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div>
                <p className="text-caption text-ink-500">파견까지</p>
                <p className="mt-1 text-display text-ink-900">D-72</p>
              </div>
              <p className="flex items-center gap-2 text-caption text-ink-500">
                <CalendarDays aria-hidden className="size-4 text-brand-600" />
                2026-03-02 출국 · 프랑스 파리
              </p>
            </div>
          </div>

          <MockPanel title="제출 서류" trailing="4 / 9">
            <ProgressBar value={44} className="mb-1" />
            <MockRow label="성적증명서" checked />
            <MockRow label="어학성적표" checked />
            <MockRow label="수학계획서" checked={false} />
          </MockPanel>

          <MockPanel title="오늘 올라온 글">
            <MockRow
              icon={<ShoppingBag className="size-4" />}
              label="자취 살림 통째로"
              trailing="€80"
            />
            <MockRow
              icon={<MapPin className="size-4" />}
              label="파리 → 니스 주말 동행"
              trailing="2/4명"
            />
            <MockRow
              icon={<MessagesSquare className="size-4" />}
              label="비자 예약, 언제 잡으셨나요?"
            />
          </MockPanel>
        </div>
      </div>
    </div>
  );
}
