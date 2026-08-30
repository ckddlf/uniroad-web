import type { Metadata, Viewport } from 'next';

import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'UIROAD — 교환학생 준비부터 현지 생활까지',
    template: '%s | UIROAD',
  },
  description:
    '파견 준비 일정, 제출 서류 체크리스트, 현지 중고거래와 동행 구하기까지. 교환학생에게 필요한 것만 모은 커뮤니티 UIROAD.',
  applicationName: 'UIROAD',
  openGraph: {
    type: 'website',
    siteName: 'UIROAD',
    locale: 'ko_KR',
    title: 'UIROAD — 교환학생 준비부터 현지 생활까지',
    description:
      '파견 준비 일정, 제출 서류 체크리스트, 현지 중고거래와 동행 구하기까지 UIROAD 하나로.',
  },
};

export const viewport: Viewport = {
  themeColor: '#17976B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/*
          Pretendard는 한글 글리프가 많아 전체 파일이 2MB에 이른다.
          unicode-range로 나눈 동적 서브셋을 셀프 호스팅해 실제로 쓰는 조각만 내려받게 한다.
        */}
        {/* eslint-disable-next-line @next/next/no-css-tags -- next/font는 unicode-range 서브셋을 표현할 수 없다 */}
        <link rel="stylesheet" href="/fonts/pretendard/pretendard.css" />
      </head>
      <body className="min-h-dvh bg-canvas text-ink-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
