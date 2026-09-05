import { Section, SectionHeading } from './Section';

/** unlock은 그 단계를 마치면 열리는 범위. 회원가입 단계에는 붙이지 않는다. */
const STEPS: { title: string; description: string; unlock?: string }[] = [
  {
    title: '회원가입',
    description: '아이디와 비밀번호만 있으면 됩니다.',
  },
  {
    title: '온보딩',
    description: '학교와 파견 정보를 알려주세요.',
    unlock: '조회 + 자유게시판 이용 가능',
  },
  {
    title: '교환학생 인증',
    description: '합격 통지서나 파견 확인서를 올려주세요.',
    unlock: '거래 · 동행 · 채팅 이용 가능',
  },
  {
    title: '전체 이용',
    description: '거래 · 동행 · 채팅까지 모두 열립니다.',
    unlock: '모든 기능 이용',
  },
];

export function HowItWorks() {
  return (
    <Section id="how" tone="surface">
      <SectionHeading
        eyebrow="How it works"
        title="이용 방법"
        description="가입하고 바로 둘러볼 수 있고, 돈과 만남이 오가는 기능만 인증 뒤에 열립니다."
      />

      <ol className="mt-12 grid gap-10 sm:mt-14 md:grid-cols-2 md:gap-x-8 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-caption font-medium text-white">
                {index + 1}
              </span>
              <span aria-hidden className="h-px flex-1 bg-ink-100" />
            </div>

            <h3 className="text-h2 text-ink-900">{step.title}</h3>
            <p className="text-body text-ink-500">{step.description}</p>

            {step.unlock && (
              <p className="mt-1 inline-flex w-fit rounded-full bg-brand-50 px-2.5 py-1 text-caption font-medium text-brand-700">
                {step.unlock}
              </p>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
