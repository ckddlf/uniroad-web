import { BadgeCheck, Globe, ShieldCheck } from 'lucide-react';

import { MockPanel, MockRow } from './MockUi';
import { IconTile, Section, SectionHeading } from './Section';

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: '교환학생 인증',
    description:
      '합격 통지서, 파견 대학 입학 허가서, 국제처 발급 파견 확인서, 파견교 학생증 중 하나를 올리면 운영진이 확인합니다.',
  },
  {
    icon: BadgeCheck,
    title: '인증된 사용자 기반 거래',
    description:
      '중고거래 · 티켓 양도 · 동행 등록과 채팅방 개설은 인증을 마친 회원만 할 수 있습니다.',
  },
  {
    icon: Globe,
    title: '파견 학교 · 국가 기준 정보',
    description: '내 파견지를 기준으로 글과 거래글을 모아 보여줍니다.',
  },
];

export function TrustSection() {
  return (
    <Section id="trust" tone="surface">
      <SectionHeading
        align="center"
        eyebrow="Trust"
        title="돈과 만남이 오가는 기능은, 인증 뒤에 엽니다"
        description="교환학생이 아닌 사람이 거래글을 올리거나 선입금을 요구하는 상황을 막기 위한 최소한의 장치입니다."
      />

      <div className="mt-14 grid items-start gap-10 sm:mt-16 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <MockPanel title="교환학생 인증" trailing="인증 완료">
            <MockRow label="합격 통지서 업로드" checked />
            <MockRow label="운영진 확인 (보통 1~2일)" checked />
            <MockRow label="중고거래 · 티켓 양도 등록" checked />
            <MockRow label="동행 등록 · 채팅방 개설" checked />
          </MockPanel>
        </div>

        <ul className="order-1 flex flex-col gap-8 lg:order-2">
          {TRUST_POINTS.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-4">
              <IconTile>
                <Icon aria-hidden className="size-5" />
              </IconTile>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-h2 text-ink-900">{title}</h3>
                <p className="text-body text-ink-500">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-14 rounded-lg border border-brand-100 bg-brand-50 p-6 sm:p-8">
        <h3 className="text-h2 text-ink-900">제출한 서류는 어떻게 다루나요?</h3>
        <p className="mt-3 max-w-3xl text-body text-ink-700">
          제출한 이미지는 심사를 맡은 운영진만 열람하며, 다른 회원에게는 공개되지 않습니다.
          <br />
          심사 목적으로만 사용하니 주민등록번호나 계좌번호는 가려서 올려주세요.
        </p>
      </div>
    </Section>
  );
}
