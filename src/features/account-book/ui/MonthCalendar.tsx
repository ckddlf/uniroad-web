'use client';

import type { MonthlySummaryResponse } from '@/shared/api/types';
import { cn } from '@/shared/lib/cn';
import { formatAmount } from '@/shared/lib/format';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export interface MonthCalendarProps {
  year: number;
  month: number;
  summary: MonthlySummaryResponse;
  selectedDate: string;
  onSelect: (date: string) => void;
  currency?: string;
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function MonthCalendar({
  year,
  month,
  summary,
  selectedDate,
  onSelect,
  currency,
}: MonthCalendarProps) {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-ink-100">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className="py-2 text-center text-caption text-ink-500">
            {weekday}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          if (day === null) return <span key={`empty-${index}`} className="min-h-16" />;

          const date = toDateKey(year, month, day);
          const daily = summary.dailySummaries?.[date];
          const selected = date === selectedDate;

          return (
            <button
              key={date}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(date)}
              className={cn(
                'flex min-h-16 flex-col items-center gap-0.5 border-b border-ink-100 p-1.5 text-caption transition-colors',
                selected ? 'bg-brand-50' : 'hover:bg-ink-100/60',
              )}
            >
              <span className={cn(selected ? 'font-medium text-brand-700' : 'text-ink-700')}>
                {day}
              </span>

              {daily?.expense ? (
                <span className="text-danger">-{formatAmount(daily.expense, currency)}</span>
              ) : null}
              {daily?.income ? (
                <span className="text-brand-600">+{formatAmount(daily.income, currency)}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
