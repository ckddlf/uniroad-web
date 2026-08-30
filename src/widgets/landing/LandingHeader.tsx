import Link from 'next/link';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="text-h2 font-bold tracking-tight text-brand-600">
          UNIROAD
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/notices"
            className="hidden rounded-md px-3 py-2 text-body text-ink-700 transition-colors hover:bg-ink-100 sm:inline-flex"
          >
            공지사항
          </Link>
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-body text-ink-700 transition-colors hover:bg-ink-100"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-brand-500 px-4 py-2 text-body font-medium text-white transition-colors hover:bg-brand-600"
          >
            무료로 시작하기
          </Link>
        </nav>
      </div>
    </header>
  );
}
