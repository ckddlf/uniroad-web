import Link from 'next/link';

import { buttonClass } from '@/shared/ui/Button';

/**
 * 랜딩 섹션으로 가는 앵커.
 * 헤더는 /notices·/terms에서도 쓰이므로 루트 기준(`/#…`) 으로 둔다.
 */
const ANCHORS = [
  { href: '/#features', label: '기능' },
  { href: '/#how', label: '이용 방법' },
  { href: '/#why', label: '왜 UNIROAD' },
  { href: '/#faq', label: '자주 묻는 질문' },
];

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-surface/85 break-keep backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-6 px-6 sm:px-8">
        <Link
          href="/"
          className="text-h2 font-bold tracking-tight text-brand-600 whitespace-nowrap"
        >
          UNIROAD
        </Link>

        <nav aria-label="페이지 안내" className="hidden items-center gap-1 lg:flex">
          {ANCHORS.map((anchor) => (
            <Link
              key={anchor.href}
              href={anchor.href}
              className="rounded-md px-3 py-2 text-body text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              {anchor.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/notices"
            className="hidden rounded-md px-3 py-2 text-body text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900 sm:inline-flex"
          >
            공지사항
          </Link>
          <Link
            href="/login"
            className={buttonClass({ variant: 'ghost', className: 'hidden sm:inline-flex' })}
          >
            로그인
          </Link>
          <Link href="/signup" className={buttonClass()}>
            바로 시작하기
          </Link>
        </div>
      </div>
    </header>
  );
}
