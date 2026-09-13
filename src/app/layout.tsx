import type { Metadata, Viewport } from 'next';

import { organizationSchema, websiteSchema } from '@/shared/lib/jsonLd';
import { SITE_NAME, SITE_URL } from '@/shared/lib/site';
import { JsonLd } from '@/shared/ui';

import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  // 상대 경로로 적은 canonical·OG 이미지를 절대 URL로 올려주는 기준점.
  // 이게 없으면 공유 미리보기의 이미지가 비어 보인다.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'UNIROAD — 교환학생 준비부터 현지 생활까지',
    template: '%s | UNIROAD',
  },
  description:
    '파견 준비 일정, 제출 서류 체크리스트, 현지 중고거래와 동행 구하기까지. 교환학생에게 필요한 것만 모은 커뮤니티 UNIROAD.',
  applicationName: 'UNIROAD',
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'ko_KR',
    url: '/',
    title: 'UNIROAD — 교환학생 준비부터 현지 생활까지',
    description:
      '파견 준비 일정, 제출 서류 체크리스트, 현지 중고거래와 동행 구하기까지 UNIROAD 하나로.',
    images: ['/logo-uniroad.png'],
  },
  // OG만으로는 X에서 작은 썸네일이 뜬다. 큰 카드로 뜨게 하려면 이 값이 필요하다.
  twitter: {
    card: 'summary_large_image',
    title: 'UNIROAD — 교환학생 준비부터 현지 생활까지',
    description:
      '파견 준비 일정, 제출 서류 체크리스트, 현지 중고거래와 동행 구하기까지 UNIROAD 하나로.',
    images: ['/logo-uniroad.png'],
  },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#1F4F9E',
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
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
