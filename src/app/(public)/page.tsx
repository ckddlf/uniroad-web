import type { Metadata } from 'next';

import { GuestOnly } from '@/features/auth/ui/GuestOnly';
import { Hero } from '@/widgets/landing/Hero';
import { LandingFooter } from '@/widgets/landing/LandingFooter';
import { LandingHeader } from '@/widgets/landing/LandingHeader';
import { NoticeAndFaq } from '@/widgets/landing/NoticeAndFaq';
import { Pillars } from '@/widgets/landing/Pillars';
import { WhyUniroad } from '@/widgets/landing/WhyUniroad';

export const metadata: Metadata = {
  title: 'UNIROAD — 교환학생 준비부터 현지 생활까지',
  description:
    '파견 준비 일정과 제출 서류 체크리스트, 현지 중고거래와 티켓 양도, 동행 구하기까지. 교환학생에게 필요한 것만 모은 커뮤니티입니다.',
  alternates: { canonical: '/' },
};

export default function LandingPage() {
  return (
    <GuestOnly>
      <LandingHeader />
      <Hero />
      <Pillars />
      <WhyUniroad />
      <NoticeAndFaq />
      <LandingFooter />
    </GuestOnly>
  );
}
