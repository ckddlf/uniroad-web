'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  /** ms, 기본 4초 */
  duration?: number;
}

interface ToastItem extends Required<Omit<ToastOptions, 'duration'>> {
  id: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLE: Record<ToastTone, { className: string; icon: ReactNode }> = {
  success: {
    className: 'border-brand-100 bg-success-bg text-brand-700',
    icon: <CheckCircle2 aria-hidden className="size-4 shrink-0" />,
  },
  error: {
    className: 'border-danger/20 bg-danger-bg text-danger',
    icon: <AlertCircle aria-hidden className="size-4 shrink-0" />,
  },
  info: {
    className: 'border-ink-100 bg-surface text-ink-900',
    icon: <Info aria-hidden className="size-4 shrink-0" />,
  },
};

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({ message, tone = 'info', duration = 4000 }: ToastOptions) => {
      const id = nextId++;
      setItems((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (message: string) => toast({ message, tone: 'success' }),
      error: (message: string) => toast({ message, tone: 'error' }),
      info: (message: string) => toast({ message, tone: 'info' }),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-md border px-4 py-3 text-body shadow-card',
              TONE_STYLE[item.tone].className,
            )}
          >
            {TONE_STYLE[item.tone].icon}
            <p className="flex-1">{item.message}</p>
            <button
              type="button"
              aria-label="알림 닫기"
              onClick={() => dismiss(item.id)}
              className="rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
            >
              <X aria-hidden className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast는 ToastProvider 안에서만 사용할 수 있습니다.');
  return context;
}
