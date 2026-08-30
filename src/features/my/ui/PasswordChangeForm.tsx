'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { z } from 'zod';

import { useUpdatePassword } from '@/features/member/api';
import { toErrorMessage } from '@/shared/api/errors';
import { cn } from '@/shared/lib/cn';
import { applyServerFieldErrors } from '@/shared/lib/form';
import { passwordChecks, passwordSchema } from '@/shared/lib/validation';
import { Button, Input, useToast } from '@/shared/ui';

const schema = z
  .object({
    // TODO(api): 현재 비밀번호를 검증하는 필드가 요청에 없어 입력만 받고 전송하지 않는다
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
    newPassword: passwordSchema,
    newPasswordConfirm: z.string().min(1, '새 비밀번호를 한 번 더 입력해주세요.'),
  })
  .refine((values) => values.newPassword === values.newPasswordConfirm, {
    path: ['newPasswordConfirm'],
    message: '비밀번호가 일치하지 않습니다.',
  });

type PasswordFormValues = z.infer<typeof schema>;

export function PasswordChangeForm() {
  const toast = useToast();
  const updatePassword = useUpdatePassword();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', newPasswordConfirm: '' },
  });

  const checks = passwordChecks(watch('newPassword'));

  const submit = handleSubmit(async (values) => {
    try {
      await updatePassword.mutateAsync({ newPassword: values.newPassword });
      reset();
      toast.success('비밀번호를 변경했어요.');
    } catch (error) {
      if (applyServerFieldErrors(error, setError, ['newPassword'])) return;
      toast.error(toErrorMessage(error));
    }
  });

  return (
    <form onSubmit={submit} className="flex max-w-md flex-col gap-4" noValidate>
      <Input
        label="현재 비밀번호"
        type="password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />

      <div className="flex flex-col gap-2">
        <Input
          label="새 비밀번호"
          type="password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />

        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {[
            { ok: checks.hasLetter, label: '영문 포함' },
            { ok: checks.hasDigit, label: '숫자 포함' },
            { ok: checks.hasLength, label: '8~20자' },
          ].map((rule) => (
            <li
              key={rule.label}
              className={cn(
                'flex items-center gap-1 text-caption',
                rule.ok ? 'text-brand-600' : 'text-ink-500',
              )}
            >
              <Check aria-hidden className="size-3.5" />
              {rule.label}
            </li>
          ))}
        </ul>
      </div>

      <Input
        label="새 비밀번호 확인"
        type="password"
        autoComplete="new-password"
        error={errors.newPasswordConfirm?.message}
        {...register('newPasswordConfirm')}
      />

      <p className="text-caption text-ink-500">
        현재 비밀번호는 화면에서만 확인하고 서버로 보내지 않아요. 서버 검증이 준비되면 함께
        확인하도록 바꿀 예정이에요.
      </p>

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          비밀번호 변경
        </Button>
      </div>
    </form>
  );
}
