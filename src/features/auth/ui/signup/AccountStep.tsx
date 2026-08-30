'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, X } from 'lucide-react';
import { z } from 'zod';

import type { SignUpRequest } from '@/shared/api/types';
import { cn } from '@/shared/lib/cn';
import {
  emailSchema,
  nameSchema,
  passwordChecks,
  passwordSchema,
  usernameSchema,
} from '@/shared/lib/validation';
import { Button, Input } from '@/shared/ui';

import { authApi } from '../../api';
import { useAvailability, type AvailabilityState } from '../../model/useAvailability';

const accountSchema = z
  .object({
    username: usernameSchema,
    name: nameSchema,
    email: z.union([emailSchema, z.literal('')]),
    password: passwordSchema,
    passwordConfirm: z.string().min(1, '비밀번호를 한 번 더 입력해주세요.'),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    path: ['passwordConfirm'],
    message: '비밀번호가 일치하지 않습니다.',
  });

type AccountFormValues = z.infer<typeof accountSchema>;

export interface AccountStepProps {
  onSubmit: (values: SignUpRequest) => void;
  onBack: () => void;
  pending: boolean;
}

export function AccountStep({ onSubmit, onBack, pending }: AccountStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    mode: 'onBlur',
    defaultValues: { username: '', name: '', email: '', password: '', passwordConfirm: '' },
  });

  const username = watch('username');
  const email = watch('email');
  const password = watch('password');

  const usernameValid = usernameSchema.safeParse(username).success;
  const emailValid = emailSchema.safeParse(email).success;

  const usernameState = useAvailability(username, usernameValid, authApi.checkUsername);
  const emailState = useAvailability(email, emailValid, authApi.checkEmail);

  const checks = passwordChecks(password);
  const blocked = usernameState === 'taken' || usernameState === 'checking' || emailState === 'taken';

  const submit = handleSubmit((values) => {
    onSubmit({
      username: values.username,
      name: values.name,
      password: values.password,
      ...(values.email ? { email: values.email } : {}),
    });
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <Input
        label="아이디"
        required
        autoComplete="username"
        autoFocus
        error={errors.username?.message ?? availabilityError(usernameState, '아이디')}
        suffix={<AvailabilityMark state={usernameState} />}
        hint="영문·숫자·밑줄 4~20자"
        {...register('username')}
      />

      <Input
        label="이름"
        required
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="이메일"
        type="email"
        autoComplete="email"
        error={errors.email?.message ?? availabilityError(emailState, '이메일')}
        suffix={<AvailabilityMark state={emailState} />}
        hint="선택 항목이에요. 입력하면 공지를 받아보실 수 있어요."
        {...register('email')}
      />

      <div className="flex flex-col gap-2">
        <Input
          label="비밀번호"
          type="password"
          required
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          <PasswordRule ok={checks.hasLetter}>영문 포함</PasswordRule>
          <PasswordRule ok={checks.hasDigit}>숫자 포함</PasswordRule>
          <PasswordRule ok={checks.hasLength}>8~20자</PasswordRule>
        </ul>
      </div>

      <Input
        label="비밀번호 확인"
        type="password"
        required
        autoComplete="new-password"
        error={errors.passwordConfirm?.message}
        {...register('passwordConfirm')}
      />

      <div className="mt-2 flex gap-2">
        <Button type="button" variant="secondary" size="lg" onClick={onBack}>
          이전
        </Button>
        <Button type="submit" size="lg" fullWidth loading={pending} disabled={blocked}>
          가입하기
        </Button>
      </div>
    </form>
  );
}

function availabilityError(state: AvailabilityState, label: string): string | undefined {
  if (state === 'taken') return `이미 사용 중인 ${label}예요.`;
  if (state === 'error') return `${label} 중복 확인에 실패했어요. 잠시 후 다시 시도해주세요.`;
  return undefined;
}

function AvailabilityMark({ state }: { state: AvailabilityState }) {
  if (state === 'checking') return <Loader2 aria-hidden className="size-4 animate-spin text-ink-500" />;
  if (state === 'available') return <span className="text-brand-600">사용 가능</span>;
  if (state === 'taken') return <X aria-hidden className="size-4 text-danger" />;
  return null;
}

function PasswordRule({ ok, children }: { ok: boolean; children: string }) {
  return (
    <li className={cn('flex items-center gap-1 text-caption', ok ? 'text-brand-600' : 'text-ink-500')}>
      <Check aria-hidden className="size-3.5" />
      {children}
    </li>
  );
}
