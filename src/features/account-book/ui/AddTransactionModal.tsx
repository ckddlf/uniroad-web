'use client';

import { useEffect, useState } from 'react';

import { toErrorMessage } from '@/shared/api/errors';
import type { AccountCategory, AccountType } from '@/shared/api/types';
import { ACCOUNT_CATEGORY } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/cn';
import { Button, DatePicker, Input, Modal, Textarea, useToast } from '@/shared/ui';

import { useAddTransaction } from '../api';

export const CATEGORY_EMOJI: Record<AccountCategory, string> = {
  FOOD: '🍽',
  TRANSPORT: '🚌',
  SHOPPING: '🛍',
  TRAVEL: '✈️',
  ETC: '📦',
  CHARGE: '💳',
};

const EXPENSE_CATEGORIES: AccountCategory[] = ['FOOD', 'TRANSPORT', 'SHOPPING', 'TRAVEL', 'ETC'];

export interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  defaultDate: string;
  currency?: string;
}

export function AddTransactionModal({
  open,
  onClose,
  defaultDate,
  currency,
}: AddTransactionModalProps) {
  const toast = useToast();
  const addTransaction = useAddTransaction();

  const [type, setType] = useState<AccountType>('EXPENSE');
  const [category, setCategory] = useState<AccountCategory>('FOOD');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (open) setDate(defaultDate);
  }, [open, defaultDate]);

  // 충전은 카테고리가 하나뿐이라 자동으로 고정한다
  useEffect(() => {
    setCategory(type === 'INCOME' ? 'CHARGE' : 'FOOD');
  }, [type]);

  const reset = () => {
    setType('EXPENSE');
    setAmount('');
    setTitle('');
    setDescription('');
    setConfirming(false);
    setError(undefined);
  };

  const close = () => {
    reset();
    onClose();
  };

  const validate = (): boolean => {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('금액을 숫자로 입력해주세요.');
      return false;
    }
    if (title.trim() === '') {
      setError('내역 이름을 입력해주세요.');
      return false;
    }
    if (date === '') {
      setError('날짜를 선택해주세요.');
      return false;
    }

    setError(undefined);
    return true;
  };

  const submit = async () => {
    try {
      await addTransaction.mutateAsync({
        amount: Number(Number(amount).toFixed(2)),
        type,
        category,
        title: title.trim(),
        transactionDate: date,
        ...(description.trim() ? { description: description.trim() } : {}),
      });

      toast.success('내역을 추가했어요.');
      close();
    } catch (caught) {
      setConfirming(false);
      toast.error(toErrorMessage(caught));
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={confirming ? '이 내역을 추가할까요?' : '내역 추가'}
      description={
        confirming ? '추가한 뒤에는 수정하거나 삭제할 수 없어요.' : undefined
      }
      footer={
        confirming ? (
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              다시 확인
            </Button>
            <Button loading={addTransaction.isPending} onClick={() => void submit()}>
              추가하기
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={close}>
              취소
            </Button>
            <Button
              onClick={() => {
                if (validate()) setConfirming(true);
              }}
            >
              다음
            </Button>
          </>
        )
      }
    >
      {confirming ? (
        <dl className="flex flex-col gap-2 text-body">
          <Row label="구분" value={type === 'INCOME' ? '충전' : '지출'} />
          <Row label="카테고리" value={`${CATEGORY_EMOJI[category]} ${ACCOUNT_CATEGORY[category]}`} />
          <Row
            label="금액"
            value={`${type === 'INCOME' ? '+' : '-'}${currency ?? ''}${Number(amount).toLocaleString('ko-KR')}`}
          />
          <Row label="내역" value={title.trim()} />
          <Row label="날짜" value={date} />
          {description.trim() && <Row label="메모" value={description.trim()} />}
        </dl>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="inline-flex overflow-hidden rounded-md border border-ink-300">
            {(['EXPENSE', 'INCOME'] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={type === value}
                onClick={() => setType(value)}
                className={cn(
                  'flex-1 px-4 py-2 text-body transition-colors',
                  type === value
                    ? 'bg-brand-500 font-medium text-white'
                    : 'bg-surface text-ink-700 hover:bg-ink-100',
                )}
              >
                {value === 'EXPENSE' ? '지출' : '충전'}
              </button>
            ))}
          </div>

          <fieldset>
            <legend className="mb-2 text-label font-medium text-ink-700">카테고리</legend>

            {type === 'INCOME' ? (
              <p className="rounded-md bg-ink-100 px-4 py-3 text-body text-ink-700">
                {CATEGORY_EMOJI.CHARGE} {ACCOUNT_CATEGORY.CHARGE}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {EXPENSE_CATEGORIES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={category === value}
                    onClick={() => setCategory(value)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-md border px-2 py-3 text-caption transition-colors',
                      category === value
                        ? 'border-brand-500 bg-brand-50 font-medium text-brand-700'
                        : 'border-ink-300 text-ink-700 hover:border-ink-500',
                    )}
                  >
                    <span aria-hidden className="text-h2">
                      {CATEGORY_EMOJI[value]}
                    </span>
                    {ACCOUNT_CATEGORY[value]}
                  </button>
                ))}
              </div>
            )}
          </fieldset>

          <Input
            label="금액"
            required
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            hint="현지 통화 기준으로 입력해주세요."
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />

          <Input
            label="내역 이름"
            required
            maxLength={50}
            placeholder="예: 점심 식사"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <DatePicker
            label="날짜"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />

          <Textarea
            label="메모"
            rows={3}
            maxLength={200}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          {error && (
            <p role="alert" className="text-caption text-danger">
              {error}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-right text-ink-900">{value}</dd>
    </div>
  );
}
