import type { Metadata } from 'next';

import { GuestOnly } from '@/features/auth/ui/GuestOnly';
import { Credentials } from '@/widgets/landing/Credentials';
import { FeatureDetails } from '@/widgets/landing/FeatureDetails';
import { FinalCta } from '@/widgets/landing/FinalCta';
import { Hero } from '@/widgets/landing/Hero';
import { HowItWorks } from '@/widgets/landing/HowItWorks';
import { LandingFooter } from '@/widgets/landing/LandingFooter';
import { LandingHeader } from '@/widgets/landing/LandingHeader';
import { NoticeAndFaq } from '@/widgets/landing/NoticeAndFaq';
import { PainPoints } from '@/widgets/landing/PainPoints';
import { Pillars } from '@/widgets/landing/Pillars';
import { TrustSection } from '@/widgets/landing/TrustSection';
import { WhyUniroad } from '@/widgets/landing/WhyUniroad';

export const metadata: Metadata = {
  title: 'UNIROAD — 교환학생 준비부터 현지 생활까지',
  description:
    '파견 준비 일정과 제출 서류 체크리스트, 현지 중고거래와 티켓 양도, 동행 구하기까지. 교환학생에게 필요한 것만 모은 커뮤니티입니다.',
  alternates: { canonical: '/' },
};

/**
 * 랜딩은 위에서 아래로 "문제 → 해결 → 기능 → 사용법 → 신뢰 → 시작"으로 읽히게 배치한다.
 * 섹션 배경은 surface / canvas를 번갈아 써서 경계선 없이도 구획이 나뉘게 했다.
 */
export default function LandingPage() {
  return (
    <GuestOnly>
      <LandingHeader />

      {/* 한글은 어절 단위로 끊어야 읽힌다. 랜딩 안쪽에만 건다. */}
      <main className="break-keep">
        <Hero />
        <PainPoints />
        <Pillars />
        <FeatureDetails />
        <HowItWorks />
        <WhyUniroad />
        <TrustSection />
        <Credentials />
        <NoticeAndFaq />
        <FinalCta />
      </main>

      <LandingFooter />
    </GuestOnly>
  );
}
