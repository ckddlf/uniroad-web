import { cn } from '@/shared/lib/cn';

export interface ProgressBarProps {
  /** 0~100 */
  value: number;
  label?: string;
  /** 막대 오른쪽에 퍼센트 표기 */
  showValue?: boolean;
  tone?: 'brand' | 'warning';
  className?: string;
}

export function ProgressBar({ value, label, showValue, tone = 'brand', className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-caption text-ink-500">
          {label && <span>{label}</span>}
          {showValue && <span>{clamped}%</span>}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-ink-100"
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-300',
            tone === 'brand' ? 'bg-brand-500' : 'bg-warning',
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
