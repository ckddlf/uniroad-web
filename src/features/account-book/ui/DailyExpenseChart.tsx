'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { MonthlySummaryResponse } from '@/shared/api/types';
import { formatAmount } from '@/shared/lib/format';

export interface DailyExpenseChartProps {
  year: number;
  month: number;
  summary: MonthlySummaryResponse;
  currency?: string;
  onSelectDate?: (date: string) => void;
}

interface ChartRow {
  day: number;
  date: string;
  expense: number;
}

function buildRows(year: number, month: number, summary: MonthlySummaryResponse): ChartRow[] {
  const daysInMonth = new Date(year, month, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { day, date, expense: summary.dailySummaries?.[date]?.expense ?? 0 };
  });
}

/**
 * 일별 소비 막대 그래프.
 * 카테고리별 집계 API가 없어 도넛 차트는 만들지 않고, 하루 단위 지출만 보여준다.
 * 한 계열뿐이라 범례 없이 제목이 계열을 설명한다.
 */
export function DailyExpenseChart({
  year,
  month,
  summary,
  currency,
  onSelectDate,
}: DailyExpenseChartProps) {
  const rows = buildRows(year, month, summary);
  const hasData = rows.some((row) => row.expense > 0);

  if (!hasData) {
    return (
      <p className="flex h-56 items-center justify-center text-body text-ink-500">
        이번 달 지출 내역이 아직 없어요.
      </p>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap={2}>
          <CartesianGrid stroke="var(--color-ink-100)" vertical={false} />

          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={{ stroke: 'var(--color-ink-100)' }}
            tick={{ fill: 'var(--color-ink-500)', fontSize: 11 }}
            interval={4}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fill: 'var(--color-ink-500)', fontSize: 11 }}
            tickFormatter={(value: number) => formatAmount(value, currency)}
          />

          <Tooltip
            cursor={{ fill: 'var(--color-ink-100)' }}
            contentStyle={{
              borderRadius: 10,
              border: '1px solid var(--color-ink-100)',
              boxShadow: 'var(--shadow-card)',
              fontSize: 13,
            }}
            labelFormatter={(day) => `${month}월 ${day}일`}
            formatter={(value) => [formatAmount(Number(value), currency), '지출']}
          />

          <Bar
            dataKey="expense"
            fill="var(--color-brand-500)"
            radius={[4, 4, 0, 0]}
            maxBarSize={18}
            onClick={(entry: unknown) => {
              const row = entry as ChartRow | undefined;
              if (row?.date) onSelectDate?.(row.date);
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
