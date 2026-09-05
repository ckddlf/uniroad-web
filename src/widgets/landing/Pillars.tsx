import { ListChecks, ShoppingBag, Users } from 'lucide-react';

import { Card, IconTile, Section, SectionHeading, ThreeUp } from './Section';

const PILLARS = [
  {
    icon: ListChecks,
    title: '정보 탐색 및 관리',
    items: [
      '파견 단계별 필요한 정보 한곳에서 확인',
      '준비 일정 · 제출 서류 체크리스트',
      '예산 · 지출 관리',
    ],
  },
  {
    icon: ShoppingBag,
    title: '거래 · 모임',
    items: ['교환학생 간 중고거래', '티켓 · 예약권 양도', '인증 기반 거래 환경'],
  },
  {
    icon: Users,
    title: '교환학생 네트워크',
    items: ['여행 동행 찾기', '현지 정보 공유', '파견 전 · 중 교환학생 네트워크'],
  },
];

export function Pillars() {
  return (
    <Section tone="surface">
      <SectionHeading eyebrow="What UNIROAD does" title="교환학생만을 위한 통합 서비스" />

      <ThreeUp className="mt-12 sm:mt-14">
        {PILLARS.map(({ icon: Icon, title, items }, index) => (
          <Card key={title} tone="canvas" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <IconTile>
                <Icon aria-hidden className="size-5" />
              </IconTile>
              <span aria-hidden className="text-label text-ink-300">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            <h3 className="text-subsection text-ink-900">{title}</h3>

            <ul className="flex flex-col gap-2 border-t border-ink-100 pt-4">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-body text-ink-700">
                  <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-brand-500" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </ThreeUp>
    </Section>
  );
}
