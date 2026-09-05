'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { isApiError, toErrorMessage } from '@/shared/api/errors';
import { applyServerFieldErrors } from '@/shared/lib/form';
import { useAuthStore } from '@/shared/store/authStore';
import { Button, Checkbox, Input, Modal, useToast } from '@/shared/ui';

import { useLogin } from '../model/useAuthActions';

/** 로그인은 기존 계정을 받는 화면이라 회원가입의 아이디 규칙을 적용하지 않는다 */
const loginSchema = z.object({
  username: z.string().min(1, '아이디를 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
  remember: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const login = useLogin();
  const clear = useAuthStore((state) => state.clear);

  const [helpOpen, setHelpOpen] = useState(false);

  const redirectTo = searchParams.get('redirectTo');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '', remember: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const token = await login.mutateAsync(values);

      if (token.status === 'NEED_ONBOARDING') {
        router.replace('/onboarding');
        return;
      }

      if (token.status === 'ACTIVE') {
        router.replace(redirectTo ?? '/home');
        return;
      }

      // 소셜 가입 전용 상태 — 일반 로그인에서는 나오지 않아야 한다
      clear();
      toast.error('지원하지 않는 계정입니다.');
    } catch (error) {
      if (applyServerFieldErrors(error, setError, ['username', 'password'])) return;

      if (isApiError(error) && error.status === 401) {
        setError('password', { message: '아이디 또는 비밀번호를 다시 확인해주세요.' });
        return;
      }

      toast.error(toErrorMessage(error));
    }
  });

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="아이디"
          autoComplete="username"
          autoFocus
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <Checkbox label="로그인 상태 유지" {...register('remember')} />

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="text-caption text-ink-500 underline-offset-2 hover:underline"
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>

        <Button type="submit" size="lg" fullWidth loading={login.isPending}>
          로그인
        </Button>
      </form>

      <p className="mt-6 text-center text-body text-ink-500">
        아직 계정이 없으신가요?{' '}
        <Link href="/signup" className="font-medium text-brand-600 hover:underline">
          회원가입
        </Link>
      </p>

      {/* TODO(api): 비밀번호 재설정 API 필요 — 지금은 문의 안내로 대체한다 */}
      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="비밀번호 재설정을 도와드릴게요"
        footer={<Button onClick={() => setHelpOpen(false)}>확인</Button>}
      >
        <p className="text-body text-ink-700">
          아직 비밀번호를 직접 재설정하는 기능이 준비되지 않았어요. 가입하신 아이디와 함께
          운영팀에 문의해주시면 확인 후 도와드리겠습니다.
        </p>
        <p className="mt-3 text-body text-ink-900">문의: uniroad.official@gmail.com</p>
      </Modal>
    </>
  );
}
