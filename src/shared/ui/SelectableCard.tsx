import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface SelectableCardProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  icon?: ReactNode;
  title: string;
  description?: string;
  cardClassName?: string;
}

/**
 * 라디오 하나를 큰 카드로 보여준다.
 * 선택 표시는 peer-checked로 처리해 별도 상태 없이 폼 값만으로 동작한다.
 */
export const SelectableCard = forwardRef<HTMLInputElement, SelectableCardProps>(
  function SelectableCard({ icon, title, description, cardClassName, className, ...props }, ref) {
    return (
      <label className={cn('relative block cursor-pointer', className)}>
        <input ref={ref} type="radio" className="peer sr-only" {...props} />

        <div
          className={cn(
            'flex h-full flex-col gap-2 rounded-lg border border-ink-300 bg-surface p-5 transition-colors',
            'hover:border-ink-500',
            'peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:ring-1 peer-checked:ring-brand-500',
            'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500',
            cardClassName,
          )}
        >
          {icon && <span className="text-h1">{icon}</span>}
          <span className="text-body font-medium text-ink-900">{title}</span>
          {description && <span className="text-caption text-ink-500">{description}</span>}
        </div>
      </label>
    );
  },
);
