import { Award, ClipboardList, Plane, Rocket } from 'lucide-react';

import { Logo } from '@/shared/ui/Logo';

import { Card, IconTile, Section, SectionHeading } from './Section';

const CREDENTIALS = [
  {
    icon: Award,
    title: 'KDB 나눔재단 14개 대학 연합 창업 성과공유회 수상',
    description: '교환학생의 정보·거래 문제를 해결하는 서비스로 성과 인정',
  },
  {
    icon: Rocket,
    title: '‘모두의창업’ 1기 선정',
    description: '초기 사업화 및 서비스 고도화 지원 프로그램 선정',
  },
  {
    icon: Plane,
    title: '독일 교환학생 실경험 기반 설계',
    description: '실제 파견 준비와 현지 생활에서 겪은 불편을 바탕으로 서비스 기획',
  },
  {
    icon: ClipboardList,
    title: '교환학생 기파견자 대상 100건+ 인터뷰·설문 진행',
    description: '인터뷰와 설문을 통해 핵심 문제와 기능 수요 검증',
  },
];

export function Credentials() {
  return (
    <Section id="proof" tone="canvas">
      <SectionHeading
        align="center"
        eyebrow="Proof"
        title={
          <>
            <Logo tone="ink" inline />는 이렇게 검증하고 인정받았어요
          </>
        }
      />

      <div className="mt-12 grid gap-5 sm:mt-14 md:grid-cols-2">
        {CREDENTIALS.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="flex gap-4">
            <IconTile>
              <Icon aria-hidden className="size-5" />
            </IconTile>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-h2 text-ink-900 text-balance">{title}</h3>
              <p className="text-body text-ink-500">{description}</p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
