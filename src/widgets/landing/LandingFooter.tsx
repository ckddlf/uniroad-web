import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="border-t border-ink-100 bg-canvas">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-h2 font-bold tracking-tight text-brand-600">UNIROAD</p>
          <p className="mt-2 max-w-sm text-caption text-ink-500">
            교환학생 준비부터 현지 생활까지. 남겨주신 기록이 다음 기수의 자료가 됩니다.
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-caption text-ink-500">
          <Link href="/notices" className="hover:text-ink-900">
            공지사항
          </Link>
          <Link href="/terms" className="hover:text-ink-900">
            이용약관 · 개인정보처리방침
          </Link>
          <a href="mailto:help@uniroad.kr" className="hover:text-ink-900">
            문의: help@uniroad.kr
          </a>
        </nav>
      </div>

      <div className="border-t border-ink-100">
        <p className="mx-auto max-w-[1200px] px-6 py-5 text-caption text-ink-500">
          © {new Date().getFullYear()} UNIROAD
        </p>
      </div>
    </footer>
  );
}
