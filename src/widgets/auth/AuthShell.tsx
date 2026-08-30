import type { ReactNode } from 'react';
import Link from 'next/link';

export interface AuthShellProps {
  title: string;
  description?: string;
  /** 회원가입처럼 여러 단계를 진행하는 화면의 진행 표시 */
  progress?: ReactNode;
  children: ReactNode;
}

/** 로그인·회원가입 공통 화면 틀 */
export function AuthShell({ title, description, progress, children }: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-8 self-start text-h2 font-bold tracking-tight text-brand-600">
        UIROAD
      </Link>

      {progress}

      <h1 className="text-h1 text-ink-900">{title}</h1>
      {description && <p className="mt-2 mb-8 text-body text-ink-500">{description}</p>}
      {!description && <div className="mb-8" />}

      {children}
    </main>
  );
}
