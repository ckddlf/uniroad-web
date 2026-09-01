import { Search, ShieldAlert, Users } from 'lucide-react';

import { IconTile, Section, SectionHeading } from './Section';

const PAIN_POINTS = [
  {
    icon: Search,
    title: '5개 이상 채널에 흩어진 교환학생 정보',
    description: '반복되는 정보 탐색으로 인한 시간 낭비',
  },
  {
    icon: ShieldAlert,
    title: '선입금 · 비대면 거래 과정에서 사기 위험',
    description: '중고거래 · 티켓 양도 등 교환학생 간 거래 신뢰 문제',
  },
  {
    icon: Users,
    title: '교환학생 간 연결의 어려움',
    description: '동행 · 정보 공유 상대를 찾기 어려움',
  },
];

export function PainPoints() {
  return (
    <Section id="problem" tone="canvas">
      <SectionHeading
        align="center"
        eyebrow="Pain point"
        title={
          <>
            복잡한 준비에 쓰는 시간은 줄이고,
            <br />
            교환학생 경험에 집중할 수 있도록
          </>
        }
      />

      <div className="mt-14 grid gap-10 sm:mt-16 sm:grid-cols-3 sm:grid-rows-[auto_auto_auto] sm:gap-8">
        {PAIN_POINTS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col gap-4 sm:row-span-3 sm:grid sm:grid-rows-subgrid">
            <IconTile>
              <Icon aria-hidden className="size-5" />
            </IconTile>
            <h3 className="text-h2 text-ink-900 text-balance">{title}</h3>
            <p className="text-body text-ink-500">{description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
