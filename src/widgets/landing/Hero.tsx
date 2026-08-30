import Link from 'next/link';
import { FileQuestion, MessagesSquare, Users } from 'lucide-react';

const PAIN_POINTS = [
  {
    icon: FileQuestion,
    title: '국제처 공지는 PDF 열 몇 개에 흩어져 있고',
    description: '마감일은 공지마다 다르고, 어떤 서류를 언제까지 내야 하는지 매번 다시 찾습니다.',
  },
  {
    icon: MessagesSquare,
    title: '귀국하는 선배 살림은 오픈카톡을 뒤져야 나오고',
    description: '방을 찾아 들어가도 이미 지난 글이라 필요한 물건은 대부분 정리된 뒤입니다.',
  },
  {
    icon: Users,
    title: '같이 여행 갈 사람은 매번 처음부터 구해야 하고',
    description: '누가 언제 어디로 가는지 모아둔 곳이 없어 일정이 맞는 사람을 찾기 어렵습니다.',
  },
];

export function Hero() {
  return (
    <>
      <section className="mx-auto max-w-[1200px] px-6 py-20 sm:py-28">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex rounded-full bg-brand-50 px-3 py-1 text-caption font-medium text-brand-700">
            교환학생을 위한 커뮤니티
          </p>
          <h1 className="text-4xl leading-tight font-bold text-ink-900 sm:text-5xl sm:leading-tight">
            교환학생 준비,
            <br />
            탭 20개 띄워놓고 하지 마세요
          </h1>
          <p className="mt-5 text-lg text-ink-500">
            파견 준비부터 현지 생활까지 UIROAD 하나로.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-md bg-brand-500 px-6 text-body font-medium text-white transition-colors hover:bg-brand-600"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center rounded-md border border-ink-300 bg-surface px-6 text-body font-medium text-ink-900 transition-colors hover:bg-ink-100"
            >
              로그인
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-ink-100 bg-surface">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-6 py-16 sm:grid-cols-3">
          {PAIN_POINTS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-3">
              <Icon aria-hidden className="size-6 text-ink-300" />
              <h3 className="text-body font-medium text-ink-900">{title}</h3>
              <p className="text-body text-ink-500">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
