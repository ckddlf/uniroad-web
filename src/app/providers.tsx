'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { isApiError } from '@/shared/api/errors';
import { ToastProvider } from '@/shared/ui/Toast';
import { AuthBootstrap } from '@/features/auth/ui/AuthBootstrap';

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        // 400·403·404는 다시 시도해도 결과가 같다. 401은 인터셉터가 재발급으로 처리한다.
        retry: (failureCount, error) => {
          if (isApiError(error) && error.status !== null && error.status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthBootstrap>{children}</AuthBootstrap>
      </ToastProvider>
    </QueryClientProvider>
  );
}
