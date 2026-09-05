import type { ReactNode } from 'react';
import { Check, Minus, X } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { Logo } from '@/shared/ui/Logo';

import { Section, SectionHeading } from './Section';

const COLUMNS = ['블로그', '오픈카톡', 'UNIROAD'] as const;

/** yes = 갖춤 / partial = 경우에 따라 다름 / no = 기대하기 어려움 */
type Mark = 'yes' | 'partial' | 'no';

const ROWS: { label: string; values: [Mark, Mark, Mark] }[] = [
  { label: '정보 최신성', values: ['no', 'partial', 'yes'] },
  { label: '기록이 남음', values: ['yes', 'no', 'yes'] },
  { label: '현지 거래', values: ['no', 'yes', 'yes'] },
  { label: '신원 확인', values: ['no', 'no', 'yes'] },
  { label: '준비 일정 관리', values: ['no', 'no', 'yes'] },
];

const MARK_LABEL: Record<Mark, string> = {
  yes: '있음',
  partial: '경우에 따라 다름',
  no: '기대하기 어려움',
};

function MarkIcon({ mark, highlight }: { mark: Mark; highlight?: boolean }) {
  const shared = 'inline-flex size-6 items-center justify-center rounded-full';

  const content: ReactNode =
    mark === 'yes' ? (
      <Check className="size-4" strokeWidth={2.5} />
    ) : mark === 'partial' ? (
      <Minus className="size-4" strokeWidth={2.5} />
    ) : (
      <X className="size-4" strokeWidth={2.5} />
    );

  return (
    <span
      className={cn(
        shared,
        mark === 'yes' && highlight && 'bg-brand-500 text-white',
        mark === 'yes' && !highlight && 'bg-brand-50 text-brand-600',
        mark === 'partial' && 'bg-ink-100 text-ink-500',
        mark === 'no' && 'text-ink-300',
      )}
    >
      {content}
      <span className="sr-only">{MARK_LABEL[mark]}</span>
    </span>
  );
}

export function WhyUniroad() {
  return (
    <Section id="why" tone="canvas">
      <SectionHeading
        eyebrow="Why UNIROAD"
        title={
          <>
            왜 <Logo tone="ink" inline />인가
          </>
        }
        description="블로그와 오픈카톡에서 흔히 겪는 아쉬움을 기준으로 정리했습니다."
      />

      <div className="mt-10 overflow-hidden rounded-lg border border-ink-100 bg-surface shadow-card">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">
              정보를 찾던 기존 방법과 UNIROAD의 일반적인 차이
            </caption>

            <thead>
              <tr className="border-b border-ink-100">
                <th scope="col" className="px-6 py-4 text-label font-medium text-ink-500">
                  비교 항목
                </th>
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className={cn(
                      'w-[140px] px-4 py-4 text-center text-label font-medium',
                      column === 'UNIROAD' ? 'bg-brand-50 text-brand-700' : 'text-ink-500',
                    )}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ROWS.map((row, rowIndex) => (
                <tr
                  key={row.label}
                  className={rowIndex === ROWS.length - 1 ? undefined : 'border-b border-ink-100'}
                >
                  <th
                    scope="row"
                    className="px-6 py-4 text-body font-medium text-ink-900"
                  >
                    {row.label}
                  </th>

                  {row.values.map((mark, index) => {
                    const isUniroad = index === COLUMNS.length - 1;

                    return (
                      <td
                        key={COLUMNS[index]}
                        className={cn('px-4 py-4 text-center', isUniroad && 'bg-brand-50/60')}
                      >
                        <MarkIcon mark={mark} highlight={isUniroad} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-caption text-ink-500 md:hidden">
        표는 좌우로 밀어서 볼 수 있어요.
      </p>
      <p className="mt-4 text-caption text-ink-500">
        아직 학교별 데이터가 없는 곳도 있어요. 남겨주신 글이 다음 기수의 자료가 됩니다.
      </p>
    </Section>
  );
}
