'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { FAQ_CATEGORIES, FAQ_ITEMS, type FaqCategory } from '@/entities/faq/items';
import { cn } from '@/shared/lib/cn';

const FILTERS: ('전체' | FaqCategory)[] = ['전체', ...FAQ_CATEGORIES];

export function FaqList() {
  const [filter, setFilter] = useState<'전체' | FaqCategory>('전체');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const items = useMemo(
    () => (filter === '전체' ? FAQ_ITEMS : FAQ_ITEMS.filter((item) => item.category === filter)),
    [filter],
  );

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => {
              setFilter(value);
              // 필터가 바뀌면 열려 있던 답이 목록에서 사라질 수 있어 접어 둔다
              setOpenQuestion(null);
            }}
            className={cn(
              'rounded-full border px-4 py-2 text-body transition-colors',
              filter === value
                ? 'border-brand-500 bg-brand-500 font-medium text-white'
                : 'border-ink-300 bg-surface text-ink-700 hover:border-ink-500 hover:text-ink-900',
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <p className="mt-8 text-caption text-ink-500">총 {items.length}개</p>

      <div className="mt-2 flex flex-col divide-y divide-ink-100 border-t border-ink-100">
        {items.map((item) => {
          const open = openQuestion === item.question;

          return (
            <div key={item.question}>
              <h2>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenQuestion(open ? null : item.question)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="flex items-baseline gap-3">
                    <span
                      aria-hidden
                      className={cn(
                        'text-body font-bold',
                        open ? 'text-brand-600' : 'text-ink-500',
                      )}
                    >
                      Q.
                    </span>
                    <span
                      className={cn(
                        'text-body font-medium',
                        open ? 'text-brand-600' : 'text-ink-900',
                      )}
                    >
                      {item.question}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      'size-4 shrink-0 text-ink-500 transition-transform',
                      open && 'rotate-180',
                    )}
                  />
                </button>
              </h2>

              {open && (
                <p className="mb-4 rounded-md bg-canvas px-5 py-4 text-body text-ink-700">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
