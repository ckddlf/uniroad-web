import type { ReactNode } from 'react';

const PILLARS = [
  {
    emoji: '💬',
    title: '커뮤니티',
    items: ['자유게시판', '파견 전 / 파견 중 게시판 분리', '댓글 · 좋아요 · 스크랩'],
  },
  {
    emoji: '🛍',
    title: '거래 · 모임',
    items: ['중고거래', '티켓 양도', '동행 구하기'],
  },
  {
    emoji: '📅',
    title: '준비 관리',
    items: ['준비 일정 타임라인', '제출 서류 체크리스트', '파견 D-day', '가계부'],
  },
];

const FEATURES: { title: string; description: string; mock: ReactNode }[] = [
  {
    title: '남은 준비를 한 화면에서',
    description:
      '학교 국제처 일정과 제출 서류를 타임라인과 체크리스트로 정리합니다. 무엇을 언제까지 내야 하는지, 지금 몇 개가 남았는지 매번 공지를 다시 열지 않아도 됩니다.',
    mock: (
      <MockPanel title="제출 서류 4/9">
        <MockRow label="성적증명서" done />
        <MockRow label="어학성적표" done />
        <MockRow label="수학계획서" />
        <MockRow label="자기소개서" />
      </MockPanel>
    ),
  },
  {
    title: '출국 전 정착 물품을 빠르고 안전하게',
    description:
      '인증된 교환학생끼리 초기 정착물품을 일괄 거래하고, 국가별로 모인 거래글에서 내 파견지에 필요한 물픔을 빠르게 탐색할 수 있습니다.',
    mock: (
      <MockPanel title="자취 살림 통째로 €80">
        <MockRow label="🍳 주방 · 냄비 2, 프라이팬 1" />
        <MockRow label="🛏 침구 · 이불 1, 베개 2" />
        <MockRow label="🔌 전자 · 전기포트 1" />
      </MockPanel>
    ),
  },
  {
    title: '못 가게 된 티켓, 버리지 않게',
    description:
      '기차·항공·공연·숙소까지 종류에 맞는 정보만 입력받습니다. 정가 대비 얼마나 저렴한지 목록에서 바로 확인할 수 있습니다.',
    mock: (
      <MockPanel title="파리 → 니스 TGV">
        <MockRow label="6/1 09:30 · 2매" />
        <MockRow label="정가 €180 → 양도가 €120" />
        <MockRow label="33% 할인" />
      </MockPanel>
    ),
  },
  {
    title: '일정이 맞는 사람과 함께',
    description:
      '언제, 어디로, 몇 명이 가는지 적어두면 조건이 맞는 사람이 찾아옵니다. 참여 연락은 카카오톡 오픈채팅으로 이어집니다.',
    mock: (
      <MockPanel title="파리 에펠탑 야경 보실 분!">
        <MockRow label="2026-06-01 ~ 06-05 (5일)" />
        <MockRow label="👥 2/4명 모집중" />
        <MockRow label="프랑스 파리" />
      </MockPanel>
    ),
  },
];

export function Pillars() {
  return (
    <>
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <h2 className="text-h1 text-ink-900">UNIROAD가 하는 일</h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="flex flex-col gap-3 rounded-lg border border-ink-100 bg-surface p-6 shadow-card"
            >
              <span className="text-h1">{pillar.emoji}</span>
              <h3 className="text-h2 text-ink-900">{pillar.title}</h3>
              <ul className="flex flex-col gap-1.5">
                {pillar.items.map((item) => (
                  <li key={item} className="text-body text-ink-500">
                    · {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-ink-100 bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-20 px-6 py-20">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex flex-col items-center gap-10 lg:flex-row ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-1">
                <h3 className="text-h1 text-ink-900">{feature.title}</h3>
                <p className="mt-4 text-body text-ink-500">{feature.description}</p>
              </div>
              <div className="w-full flex-1">{feature.mock}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/** 실제 화면을 본떠 그린 예시 패널 (스크린샷이 아니라 설명용 도식이다) */
function MockPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-canvas p-5 shadow-card">
      <p className="mb-3 text-label font-medium text-ink-700">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function MockRow({ label, done }: { label: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-surface px-3 py-2 text-caption text-ink-700">
      <span aria-hidden className={done ? 'text-brand-500' : 'text-ink-300'}>
        {done ? '☑' : '☐'}
      </span>
      {label}
    </div>
  );
}
