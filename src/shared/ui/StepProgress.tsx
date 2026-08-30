import { cn } from '@/shared/lib/cn';

export interface StepProgressProps {
  /** 1부터 시작하는 현재 단계 */
  current: number;
  steps: string[];
  className?: string;
}

/** 회원가입·온보딩처럼 여러 단계를 진행하는 화면 상단의 진행 표시 */
export function StepProgress({ current, steps, className }: StepProgressProps) {
  const percent = Math.round((current / steps.length) * 100);

  return (
    <div className={cn('mb-8 flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between text-caption">
        <span className="font-medium text-brand-600">
          {current}단계 · {steps[current - 1]}
        </span>
        <span className="text-ink-500">
          {current} / {steps.length}
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label="진행 상황"
        className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100"
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
