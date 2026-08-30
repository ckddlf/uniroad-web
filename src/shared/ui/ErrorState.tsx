'use client';

import { AlertTriangle, WifiOff } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { isApiError, toErrorMessage } from '@/shared/api/errors';

import { Button } from './Button';

export interface ErrorStateProps {
  /** 훅에서 받은 에러 객체를 그대로 넘기면 메시지를 알아서 고른다 */
  error?: unknown;
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, title, description, onRetry, className }: ErrorStateProps) {
  const offline = isApiError(error) && error.isNetwork;
  const message = description ?? toErrorMessage(error);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-ink-100 bg-surface px-6 py-16 text-center',
        className,
      )}
      role="alert"
    >
      <div className="text-ink-300">
        {offline ? <WifiOff aria-hidden className="size-8" /> : <AlertTriangle aria-hidden className="size-8" />}
      </div>

      <p className="text-h2 text-ink-900">
        {title ?? (offline ? '연결이 끊겼어요' : '문제가 발생했어요')}
      </p>
      <p className="max-w-md text-body text-ink-500">{message}</p>

      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-2">
          다시 시도
        </Button>
      )}
    </div>
  );
}
