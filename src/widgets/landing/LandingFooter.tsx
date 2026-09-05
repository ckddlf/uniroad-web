import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="border-t border-ink-100 bg-surface break-keep">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-14 sm:px-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-h2 font-bold tracking-tight text-brand-600">UNIROAD</p>
          <p className="mt-3 max-w-sm text-body text-ink-500">
            교환학생 준비부터 현지 생활까지. 남겨주신 기록이 다음 기수의 자료가 됩니다.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 sm:gap-16">
          <nav aria-label="서비스" className="flex flex-col gap-3">
            <p className="text-label text-ink-900">서비스</p>
            <Link
              href="/#features"
              className="text-body text-ink-500 transition-colors hover:text-ink-900"
            >
              기능
            </Link>
            <Link href="/#how" className="text-body text-ink-500 transition-colors hover:text-ink-900">
              이용 방법
            </Link>
            <Link href="/#faq" className="text-body text-ink-500 transition-colors hover:text-ink-900">
              자주 묻는 질문
            </Link>
          </nav>

          <nav aria-label="안내" className="flex flex-col gap-3">
            <p className="text-label text-ink-900">안내</p>
            <Link href="/blog" className="text-body text-ink-500 transition-colors hover:text-ink-900">
              블로그
            </Link>
            <Link href="/notices" className="text-body text-ink-500 transition-colors hover:text-ink-900">
              공지사항
            </Link>
            <Link href="/terms" className="text-body text-ink-500 transition-colors hover:text-ink-900">
              이용약관 · 개인정보처리방침
            </Link>
            <a
              href="mailto:uniroad.official@gmail.com"
              className="text-body text-ink-500 transition-colors hover:text-ink-900"
            >
              문의: uniroad.official@gmail.com
            </a>
          </nav>
        </div>
      </div>

      <div className="border-t border-ink-100">
        <p className="mx-auto w-full max-w-[1200px] px-6 py-5 text-caption text-ink-500 sm:px-8">
          © {new Date().getFullYear()} UNIROAD
        </p>
      </div>
    </footer>
  );
}
