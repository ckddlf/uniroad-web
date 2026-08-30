import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-display text-ink-300">404</p>
      <h1 className="text-h1 text-ink-900">찾을 수 없는 페이지예요</h1>
      <p className="text-body text-ink-500">
        주소가 바뀌었거나 삭제된 글일 수 있어요.
      </p>

      <Link
        href="/"
        className="mt-4 inline-flex h-10 items-center rounded-md bg-brand-500 px-4 text-body font-medium text-white transition-colors hover:bg-brand-600"
      >
        처음으로
      </Link>
    </main>
  );
}
