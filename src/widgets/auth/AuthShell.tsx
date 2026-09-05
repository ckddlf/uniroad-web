import type { ReactNode } from 'react';
import Link from 'next/link';

import { Logo } from '@/shared/ui/Logo';

export interface AuthShellProps {
  /** 로고 이미지를 섞어 넣는 화면이 있어 문자열이 아니라 노드로 받는다 */
  title: ReactNode;
  description?: string;
  /** 회원가입처럼 여러 단계를 진행하는 화면의 진행 표시 */
  progress?: ReactNode;
  children: ReactNode;
}

/** 로그인·회원가입 공통 화면 틀 */
export function AuthShell({ title, description, progress, children }: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" aria-label="UNIROAD 홈" className="mb-8 self-start">
        <Logo className="h-6" />
      </Link>

      {progress}

      <h1 className="text-h1 text-ink-900">{title}</h1>
      {description && <p className="mt-2 mb-8 text-body text-ink-500">{description}</p>}
      {!description && <div className="mb-8" />}

      {children}
    </main>
  );
}
