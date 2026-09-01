import type { ReactNode } from 'react';
import {
  BedDouble,
  CalendarDays,
  ListChecks,
  MapPin,
  Plug,
  ShoppingBag,
  Ticket,
  UtensilsCrossed,
  Users,
} from 'lucide-react';

import { ProgressBar } from '@/shared/ui/ProgressBar';

import { MockPanel, MockRow } from './MockUi';
import { IconTile, Section, SectionHeading } from './Section';

type Feature = {
  key: string;
  label: string;
  icon: typeof ListChecks;
  title: string;
  description: ReactNode;
  mock: ReactNode;
};

/** 설명 문장 안에서 한 번만 힘을 주는 자리 */
function Em({ children }: { children: ReactNode }) {
  return <strong className="font-medium text-ink-900">{children}</strong>;
}

const FEATURES: Feature[] = [
  {
    key: 'prep',
    label: 'PREP',
    icon: ListChecks,
    title: '흩어진 준비 과정을 한 화면에서',
    description: (
      <>
        준비 일정과 제출 서류를 <Em>타임라인·체크리스트로 정리</Em>해 한눈에 관리할 수 있습니다.
      </>
    ),
    mock: (
      <MockPanel title="제출 서류" trailing="4 / 9">
        <ProgressBar value={44} className="mb-1" />
        <MockRow label="성적증명서" checked />
        <MockRow label="어학성적표" checked />
        <MockRow label="수학계획서" checked={false} />
        <MockRow label="자기소개서" checked={false} />
      </MockPanel>
    ),
  },
  {
    key: 'trade',
    label: 'TRADE',
    icon: ShoppingBag,
    title: '정착 물품 거래를 더 빠르고 안전하게',
    description: (
      <>
        인증된 교환학생 간 거래로 필요한 물품을 <Em>쉽게 찾고 안심하고 거래</Em>할 수 있습니다.
      </>
    ),
    mock: (
      <MockPanel title="자취 살림 통째로" trailing="€80">
        <MockRow icon={<UtensilsCrossed className="size-4" />} label="주방 · 냄비 2, 프라이팬 1" />
        <MockRow icon={<BedDouble className="size-4" />} label="침구 · 이불 1, 베개 2" />
        <MockRow icon={<Plug className="size-4" />} label="전자 · 전기포트 1" />
      </MockPanel>
    ),
  },
  {
    key: 'ticket',
    label: 'TICKET',
    icon: Ticket,
    title: '못 쓰게 된 티켓도 필요한 사람에게',
    description: (
      <>
        기차·항공·공연·숙소 티켓을 <Em>유형별로 등록하고 빠르게 양도</Em>할 수 있습니다.
      </>
    ),
    mock: (
      <MockPanel title="파리 → 니스 TGV" trailing="양도">
        <MockRow icon={<CalendarDays className="size-4" />} label="6/1 09:30 출발 · 2매" />
        <MockRow icon={<Ticket className="size-4" />} label="정가 €180" trailing="€120" />
        <MockRow label="정가 대비 33% 저렴" emphasis />
      </MockPanel>
    ),
  },
  {
    key: 'matching',
    label: 'MATCHING',
    icon: Users,
    title: '일정이 맞는 교환학생과 쉽게 연결',
    description: (
      <>
        조건이 맞는 교환학생을 찾아 <Em>동행과 정보 공유로 연결</Em>할 수 있습니다.
      </>
    ),
    mock: (
      <MockPanel title="파리 에펠탑 야경 보실 분!" trailing="모집중">
        <MockRow icon={<CalendarDays className="size-4" />} label="2026-06-01 ~ 06-05 (5일)" />
        <MockRow icon={<MapPin className="size-4" />} label="프랑스 파리" />
        <MockRow icon={<Users className="size-4" />} label="함께 갈 사람" trailing="2 / 4명" />
      </MockPanel>
    ),
  },
];

export function FeatureDetails() {
  return (
    <Section id="features" tone="canvas">
      <SectionHeading
        eyebrow="Features"
        title="준비부터 현지 생활까지, 네 가지 흐름"
        description="출국 전 준비, 정착 물품 거래, 티켓 양도, 동행 찾기. 교환학생 기간에 실제로 필요한 순서대로 이어집니다."
      />

      <div className="mt-16 flex flex-col gap-20 sm:mt-20 lg:gap-24">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <article
              key={feature.key}
              className={`flex flex-col items-center gap-10 lg:flex-row lg:gap-16 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="w-full flex-1">
                <IconTile>
                  <Icon aria-hidden className="size-5" />
                </IconTile>
                <p className="mt-5 text-label tracking-[0.16em] text-brand-600 uppercase">
                  {feature.label}
                </p>
                <h3 className="mt-2 text-subsection text-ink-900 text-balance">{feature.title}</h3>
                <p className="mt-4 max-w-xl text-lead text-ink-500">{feature.description}</p>
              </div>

              <div className="w-full flex-1">{feature.mock}</div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
